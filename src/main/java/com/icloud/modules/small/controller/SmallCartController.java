package com.icloud.modules.small.controller;

import java.util.Arrays;
import java.util.Map;
import com.icloud.basecommon.model.Query;
import com.icloud.modules.sys.controller.AbstractController;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.icloud.modules.small.entity.SmallCart;
import com.icloud.modules.small.service.SmallCartService;
import com.icloud.basecommon.model.Query;
import com.icloud.common.PageUtils;
import com.icloud.common.R;
import com.icloud.common.validator.ValidatorUtils;


/**
 * 购物车
 *
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-08-13 14:34:02
 * 菜单主连接： modules/small/smallcart.html
 */
@RestController
@RequestMapping("small/smallcart")
public class SmallCartController extends AbstractController {
    @Autowired
    private SmallCartService smallCartService;

    /**
     * 列表
     */
    @RequestMapping("/list")
    @RequiresPermissions("small:smallcart:list")
    public R list(@RequestParam Map<String, Object> params){
        Query query = new Query(params);
        PageUtils page = smallCartService.findByPage(query.getPageNum(),query.getPageSize(), query);

        return R.ok().put("page", page);
    }


    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    @RequiresPermissions("small:smallcart:info")
    public R info(@PathVariable("id") Long id){
        SmallCart smallCart = (SmallCart)smallCartService.getById(id);

        return R.ok().put("smallCart", smallCart);
    }

    /**
     * 保存
     */
    @RequestMapping("/save")
    @RequiresPermissions("small:smallcart:save")
    public R save(@RequestBody SmallCart smallCart){
        smallCartService.save(smallCart);

        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @RequiresPermissions("small:smallcart:update")
    public R update(@RequestBody SmallCart smallCart){
        ValidatorUtils.validateEntity(smallCart);
        smallCartService.updateById(smallCart);
        
        return R.ok();
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    @RequiresPermissions("small:smallcart:delete")
    public R delete(@RequestBody Long[] ids){
        smallCartService.removeByIds(Arrays.asList(ids));

        return R.ok();
    }

}
