package com.icloud.modules.small.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.icloud.basecommon.model.Query;
import com.icloud.modules.small.entity.SmallSpu;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.icloud.modules.small.entity.SmallSku;
import com.icloud.modules.small.service.SmallSkuService;
import com.icloud.basecommon.model.Query;
import com.icloud.common.PageUtils;
import com.icloud.common.R;
import com.icloud.common.validator.ValidatorUtils;


/**
 * 商品sku
 *
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-08-13 14:34:02
 * 菜单主连接： modules/small/smallsku.html
 */
@Slf4j
@RestController
@RequestMapping("small/smallsku")
public class SmallSkuController {
    @Autowired
    private SmallSkuService smallSkuService;

    /**
     * 列表
     */
    @RequestMapping("/list")
    @RequiresPermissions("small:smallspu:list")
    public R list(@RequestParam Map<String, Object> params){
        Query query = new Query(params);
        PageUtils page = smallSkuService.findByPage(query.getPageNum(),query.getPageSize(), query);

        return R.ok().put("page", page);
    }
    /**
     * 列表
     */
    @RequestMapping("/skulist")
    @RequiresPermissions("small:smallspu:list")
    public R skulist(@RequestParam Long spuId){
        List<SmallSku> list = smallSkuService.list(new QueryWrapper<SmallSku>().eq("spu_id",spuId));
        list.forEach(p->{
            Integer remainStock = (p.getStock()!=null?p.getStock().intValue():0) - (p.getFreezeStock()!=null?p.getFreezeStock().intValue():0);
            p.setRemainStock(remainStock>0?remainStock:0);
        });
        return R.ok().put("list", list);
    }


    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    @RequiresPermissions("small:smallspu:info")
    public R info(@PathVariable("id") Long id){
        SmallSku smallSku = (SmallSku)smallSkuService.getById(id);
        Integer remainStock = (smallSku.getStock()!=null?smallSku.getStock().intValue():0) - (smallSku.getFreezeStock()!=null?smallSku.getFreezeStock().intValue():0);
        smallSku.setRemainStock(remainStock>0?remainStock:0);
        return R.ok().put("smallSku", smallSku);
    }

    /**
     * 保存
     */
    @RequestMapping("/save")
    @RequiresPermissions("small:smallspu:save")
    public R save(@RequestBody SmallSku smallSku){
//        ValidatorUtils.validateEntity(smallSku);
        log.info("smallSpu==="+ JSON.toJSONString(smallSku));
        if(smallSku.getAddStock()!=null && smallSku.getAddStock()>0){
            smallSku.setFreezeStock(0);
            smallSku.setStock(smallSku.getAddStock());
        }else{
            smallSku.setStock(0);
            smallSku.setFreezeStock(0);
        }
        smallSkuService.save(smallSku);
        smallSku.setRemainStock(smallSku.getStock()>0?smallSku.getStock():0);
        return R.ok().put("smallSku", smallSku);
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @RequiresPermissions("small:smallspu:update")
    public R update(@RequestBody SmallSku smallSku){
        log.info("smallSpu==="+ JSON.toJSONString(smallSku));

        //增加总库存
        if(smallSku.getAddStock()!=null && smallSku.getAddStock()>0){
            smallSku.setStock(smallSku.getStock()!=null?smallSku.getStock().intValue()+smallSku.getAddStock().intValue():smallSku.getAddStock());
            //减少总库存
        }else if(smallSku.getAddStock()!=null && smallSku.getAddStock()<=0){
            Integer stock = smallSku.getStock()!=null?smallSku.getStock().intValue()+smallSku.getAddStock().intValue():smallSku.getAddStock();
            //总库存 不能小于已 冻结库存
            if(stock<=0){
                smallSku.setStock(smallSku.getFreezeStock()!=null?smallSku.getFreezeStock():0);
            }else{
                smallSku.setStock(stock-(smallSku.getFreezeStock()!=null?smallSku.getFreezeStock():0)>0?stock:smallSku.getFreezeStock());
            }
        }
        smallSkuService.updateById(smallSku);
        Integer remainStock = (smallSku.getStock()!=null?smallSku.getStock().intValue():0) - (smallSku.getFreezeStock()!=null?smallSku.getFreezeStock().intValue():0);
        smallSku.setRemainStock(remainStock>0?remainStock:0);
        return R.ok().put("smallSku", smallSku);
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    @RequiresPermissions("small:smallspu:delete")
    public R delete(@RequestBody Long[] ids){
        smallSkuService.removeByIds(Arrays.asList(ids));

        return R.ok();
    }

}