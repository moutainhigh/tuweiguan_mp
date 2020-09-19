package com.icloud.modules.small.service;

import cn.hutool.core.lang.Snowflake;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icloud.basecommon.service.BaseServiceImpl;
import com.icloud.basecommon.service.redislock.DistributedLock;
import com.icloud.basecommon.service.redislock.DistributedLockUtil;
import com.icloud.common.*;
import com.icloud.config.ServerConfig;
import com.icloud.config.threadpool.ThreadPoodExecuteService;
import com.icloud.exceptions.ApiException;
import com.icloud.modules.shop.entity.Shop;
import com.icloud.modules.shop.service.ShopService;
import com.icloud.modules.small.dao.SmallOrderMapper;
import com.icloud.modules.small.entity.*;
import com.icloud.modules.small.vo.CreateOrder;
import com.icloud.modules.wx.entity.WxUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 订单表
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-08-13 14:34:02
 */
@Slf4j
@Service
@Transactional
public class SmallOrderService extends BaseServiceImpl<SmallOrderMapper,SmallOrder> {

    @Autowired
    private SmallOrderMapper smallOrderMapper;
    @Autowired
    private SmallSkuService smallSkuService;
    @Autowired
    private SmallSpuService smallSpuService;
    @Autowired
    private SmallOrderDetailService smallOrderDetailService;
    @Autowired
    private SmallCartService smallCartService;
    @Autowired
    private ShopService shopService;
    @Autowired
    private SmallGroupShopService smallGroupShopService;
    @Autowired
    private DistributedLockUtil distributedLockUtil;

    @Autowired
    private ServerConfig serverConfig;


    @Override
    public PageUtils<SmallOrder> findByPage(int pageNo, int pageSize, Map<String, Object> query) {
        try {
            query =  MapEntryUtils.mapvalueToBeanValueAndBeanProperyToColum(query, SmallOrder.class);
        } catch (Exception e) {
            e.printStackTrace();
        }
        PageHelper.startPage(pageNo, pageSize);
        List<SmallOrder> list = smallOrderMapper.queryMixList(MapEntryUtils.clearNullValue(query));
        PageInfo<SmallOrder> pageInfo = new PageInfo<SmallOrder>(list);
        PageUtils<SmallOrder> page = new PageUtils<SmallOrder>(list,(int)pageInfo.getTotal(),pageSize,pageNo);
        return page;
    }

    public R createOrder(CreateOrder preOrder, WxUser user, SmallAddress address) {
        BigDecimal totalAmout = new BigDecimal(0);//订单总金额
        int totalNum = 0;//总数量
        //1、库存校验
        for(int i=0;i<preOrder.getSkuId().length;i++){
            SmallGroupShop group = (SmallGroupShop) smallGroupShopService.getById(preOrder.getGroupId()[i]);
            SmallSku spu = (SmallSku) smallSkuService.getById(preOrder.getSkuId()[i]);
            if(group.getSupplierId().longValue()!=preOrder.getSupplierId().longValue()){
                return R.error("团购商品与商户对应不上");
            }

            //剩余库存
            int remainStock = spu.getStock()-(spu.getFreezeStock()!=null?spu.getFreezeStock():0);
            if(remainStock<=0 || remainStock<preOrder.getNum()[i]){
                return R.error(spu.getTitle()+" 库存不足");
            }
//            totalAmout+=spu.getPrice()*preOrder.getNum()[i];
            totalAmout = totalAmout.add(spu.getPrice().multiply(new BigDecimal(preOrder.getNum()[i])).setScale(2,BigDecimal.ROUND_HALF_UP));
            totalNum+=preOrder.getNum()[i];
        }
        //2、冻结库存
        for(int i=0;i<preOrder.getSkuId().length;i++){
            Long skuId = preOrder.getSkuId()[i];
            Integer num = preOrder.getNum()[i].intValue();
            DistributedLock lock = distributedLockUtil.getDistributedLock(skuId.toString());
            try {
                if (lock.acquire()) {
                    //获取锁成功业务代码
                    SmallSku spu = (SmallSku) smallSkuService.getById(skuId);
//                    SmallSpu spu = (SmallSpu) smallSpuService.getById(skuId);
                    spu.setFreezeStock(spu.getFreezeStock()!=null?spu.getFreezeStock()+num:num);
                    boolean result = smallSkuService.updateById(spu);
                    if(!result){
                        log.error("兑换时,更新商品库存失败");
                        throw new ApiException("更新商品库存失败");
                    }
                } else { // 获取锁失败
                    //获取锁失败业务代码
                    throw new ApiException("系统繁忙,请稍后再试");
                }
            } finally {
                if (lock != null) {
                    lock.release();
                }
            }
        }
        //生成订单
        SmallOrder order = new SmallOrder();
        order.setChannel("店铺二维码扫码支付");
        order.setActualPrice(totalAmout);
        order.setSkuTotalPrice(totalAmout);
        order.setAddress(address.getAddress());
        order.setCounty(address.getCounty());
        order.setCity(address.getCity());
        order.setPhone(address.getPhone());
        order.setProvince(address.getProvince());
        order.setConsignee(address.getName());
        order.setUserId(user.getId().longValue());
        order.setOrderStatus(0);
        order.setCreateTime(new Date());
        order.setMemo(preOrder.getMemo());
        order.setSupplierId(preOrder.getSupplierId());
        order.setOrderType("0");
        order.setOrderNo(SnowflakeUtils.getOrderNoByWordId(serverConfig.getServerPort()%31L));
        order.setOrderStatus(0);//
        order.setPayChannel("微信支付");
        order.setRefundStatus(0);
        order.setShipStatus(0);
        smallOrderMapper.insert(order);

        String productInfo = "";
        for(int i=0;i<preOrder.getSkuId().length;i++){
//            SmallSpu spu = (SmallSpu) smallSpuService.getById(preOrder.getSkuId()[i]);
            SmallSku sku = (SmallSku) smallSkuService.getById(preOrder.getSkuId()[i]);
            SmallGroupShop group = (SmallGroupShop) smallGroupShopService.getById(preOrder.getGroupId()[i]);
            SmallSpu spus = (SmallSpu) smallSpuService.getById(sku.getSpuId());
            SmallOrderDetail detail = new SmallOrderDetail();
            detail.setCreateTime(new Date());
            detail.setNum(preOrder.getNum()[i].intValue());
            detail.setOrderNo(order.getOrderNo());
            detail.setOrderId(order.getId());
            detail.setGroupId(preOrder.getGroupId()[i]);
            detail.setSkuId(preOrder.getSkuId()[i]);
            detail.setSkuTitle(sku.getTitle());
            detail.setSpuImg(sku.getImg()!=null?sku.getImg(): spus.getImg());
            detail.setPrice(group.getMinPrice());
            productInfo+=sku.getTitle()+"x"+detail.getNum()+";";
//            detail
            smallOrderDetailService.save(detail);
        }
        //清空对应的购物车
        for(int i=0;i<preOrder.getSkuId().length;i++){
            smallCartService.remove(new QueryWrapper<SmallCart>()
                    .eq("user_id",user.getId())
                    .eq("group_id",preOrder.getGroupId()[i])
                    .eq("sku_id",preOrder.getNum()[i])
                    .eq("supplier_id",preOrder.getSupplierId()));

        }
        Shop shop = (Shop) shopService.getById(preOrder.getSupplierId());

        //生成发送通知消息任务，设置需要发送的消息
        //SmallPlaceOrderNotifyService smallPlaceOrderNotifyService = new SmallPlaceOrderNotifyService();
        //smallPlaceOrderNotifyService.setNotifyInof(order,user,shop,productInfo);
        //异步执行发送任务
       // ThreadPoodExecuteService.getTaskExecutor().execute(smallPlaceOrderNotifyService);

        return R.ok().put("orderNo",order.getOrderNo());
    }
}

