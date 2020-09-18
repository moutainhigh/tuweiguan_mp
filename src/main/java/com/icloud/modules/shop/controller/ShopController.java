package com.icloud.modules.shop.controller;

import java.util.*;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.icloud.basecommon.model.Query;
import com.icloud.common.Constant;
import com.icloud.modules.small.entity.SmallCategory;
import com.icloud.modules.small.vo.ShopTreeVo;
import com.icloud.modules.sys.controller.AbstractController;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.icloud.modules.shop.entity.Shop;
import com.icloud.modules.shop.service.ShopService;
import com.icloud.common.PageUtils;
import com.icloud.common.R;
import com.icloud.common.validator.ValidatorUtils;


/**
 * 店铺 
 *
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-09-17 16:07:50
 * 菜单主连接： modules/shop/shop.html
 */
@RestController
@RequestMapping("shop/shop")
public class ShopController extends AbstractController {
    @Autowired
    private ShopService shopService;

    /**
     * 列表
     */
    @RequestMapping("/list")
    @RequiresPermissions("shop:shop:list")
    public R list(@RequestParam Map<String, Object> params){
        Query query = new Query(params);
        PageUtils page = shopService.findByPage(query.getPageNum(),query.getPageSize(), query);
        List<Shop> list = page.getList();
        if(list!=null && list.size()>0){
            list.forEach(p->{
                if(p.getParentId()!=null){
                    Object parent = shopService.getById(p.getId());
                    if(parent!=null){
                        p.setParentName((((Shop)parent).getShopName()));
                    }
                }
            });
        }
        page.setList(list);
        return R.ok().put("page", page);
    }
    /**
     * 店铺树
     */
    @RequestMapping("/select")
    @RequiresPermissions("small:smallcategory:update")
    public R select(){
        List<Shop> list = shopService.list(new QueryWrapper<Shop>().eq("review","1"));
        List<ShopTreeVo> shopTreeVolist = new ArrayList<ShopTreeVo>();
        if(list!=null && list.size()>0){
            ShopTreeVo shopvo = null;
            for (Shop shop:list){
                shopvo = new ShopTreeVo();
                shopvo.setId(shop.getId());
                shopvo.setName(shop.getShopName());
                shopvo.setParentId(shop.getParentId());
                if(shop.getParentId()!=null){
                    Object parent = shopService.getById(shop.getId());
                    if(parent!=null){
                        shopvo.setParentName((((Shop)parent).getShopName()));
                    }
                }
                shopTreeVolist.add(shopvo);
            }
        }
        if(getUserId() == Constant.SUPER_ADMIN) {
            ShopTreeVo root = new ShopTreeVo();
            root.setId(0L);
            root.setName("一级店铺");
            root.setParentId(-1L);
            shopTreeVolist.add(root);
        }
        return R.ok().put("retailList", shopTreeVolist);
    }
    /**
     * 列表
     */
    @RequestMapping("/selectlist")
    public R attibutList(){
        List<Shop> list = shopService.list(new QueryWrapper<Shop>());
        return R.ok().put("list", list);
    }

//    /**
//     * 选择所属店铺
//     */
//    @RequestMapping("/select")
//    @RequiresPermissions("shop:shop:update")
//    public R select(){
//        List<Shop> retailList = shopService.list();
//        List<ShopTreeVo> list =  new ArrayList<ShopTreeVo>();
//        ShopTreeVo vo = null;
//        if(list!=null){
//            for (Shop shop : retailList) {
//                vo =  new ShopTreeVo();
//                vo.setId(shop.getId());
//                vo.setName(shop.getShopName());
//                vo.setParentId(null);
//                vo.setParentName(null);
//                list.add(vo);
//            }
//        }
//        return R.ok().put("retailList", list);
//    }

    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    @RequiresPermissions("shop:shop:info")
    public R info(@PathVariable("id") Long id){
        Shop shop = (Shop)shopService.getById(id);

        return R.ok().put("shop", shop);
    }

    /**
     * 保存
     */
    @RequestMapping("/save")
    @RequiresPermissions("shop:shop:save")
    public R save(@RequestBody Shop shop){
        shopService.save(shop);

        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @RequiresPermissions("shop:shop:update")
    public R update(@RequestBody Shop shop){
        ValidatorUtils.validateEntity(shop);
        shopService.updateById(shop);
        
        return R.ok();
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    @RequiresPermissions("shop:shop:delete")
    public R delete(@RequestBody Long[] ids){
        shopService.removeByIds(Arrays.asList(ids));

        return R.ok();
    }

}