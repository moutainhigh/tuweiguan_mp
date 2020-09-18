package com.icloud.modules.shop.controller;

import java.util.Arrays;
import java.util.Map;
import com.icloud.basecommon.model.Query;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.icloud.modules.shop.entity.ShopBank;
import com.icloud.modules.shop.service.ShopBankService;
import com.icloud.basecommon.model.Query;
import com.icloud.common.PageUtils;
import com.icloud.common.R;
import com.icloud.common.validator.ValidatorUtils;


/**
 * 店铺银行卡 用于店铺提现
 *
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-09-17 16:07:50
 * 菜单主连接： modules/shop/shopbank.html
 */
@RestController
@RequestMapping("shop/shopbank")
public class ShopBankController {
    @Autowired
    private ShopBankService shopBankService;

    /**
     * 列表
     */
    @RequestMapping("/list")
    @RequiresPermissions("shop:shopbank:list")
    public R list(@RequestParam Map<String, Object> params){
        Query query = new Query(params);
        PageUtils page = shopBankService.findByPage(query.getPageNum(),query.getPageSize(), query);

        return R.ok().put("page", page);
    }


    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    @RequiresPermissions("shop:shopbank:info")
    public R info(@PathVariable("id") Long id){
        ShopBank shopBank = (ShopBank)shopBankService.getById(id);

        return R.ok().put("shopBank", shopBank);
    }

    /**
     * 保存
     */
    @RequestMapping("/save")
    @RequiresPermissions("shop:shopbank:save")
    public R save(@RequestBody ShopBank shopBank){
        shopBankService.save(shopBank);

        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @RequiresPermissions("shop:shopbank:update")
    public R update(@RequestBody ShopBank shopBank){
        ValidatorUtils.validateEntity(shopBank);
        shopBankService.updateById(shopBank);
        
        return R.ok();
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    @RequiresPermissions("shop:shopbank:delete")
    public R delete(@RequestBody Long[] ids){
        shopBankService.removeByIds(Arrays.asList(ids));

        return R.ok();
    }

}