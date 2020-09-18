package com.icloud.modules.shop.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 店员 
 * 
 * @author zdh
 * @email yyyyyy@cm.com
 * @date 2020-09-17 16:07:50
 */
@Data
@TableName("shop_man")
public class ShopMan implements Serializable {
	private static final long serialVersionUID = 1L;

   	   /* 店员ID */
       @TableId(value="id", type= IdType.AUTO)
       private Long id;
   	   	   /* 所属店铺 */
       @TableField("shop_id")
       private Long shopId;
   	   	   /* 姓名 */
       @TableField("name")
       private String name;
   	   	   /* 登录账号 */
       @TableField("account_no")
       private String accountNo;
   	   	   /* 手机号 */
       @TableField("mobile")
       private String mobile;
   	   	   /* 登录密码 */
       @TableField("pwd")
       private String pwd;
   	   	   /* 角色 0:管理员 */
       @TableField("role")
       private Integer role;
   	   	   /* 状态 0：关闭，1：开启 */
       @TableField("status")
       private String status;
   	   	   /* 创建人 */
       @TableField("created_by")
       private String createdBy;
   	   	   /* 创建时间 */
       @TableField("created_time")
       private Date createdTime;
   	   	   /* 更新人 */
       @TableField("updated_by")
       private String updatedBy;
   	   	   /* 更新时间 */
       @TableField("updated_time")
       private Date updatedTime;
   	
}