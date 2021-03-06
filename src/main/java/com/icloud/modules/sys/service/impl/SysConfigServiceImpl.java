package com.icloud.modules.sys.service.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.icloud.basecommon.service.redis.RedisService;
import com.icloud.common.PageUtils;
import com.icloud.common.Query;
import com.icloud.exceptions.BaseException;
import com.icloud.modules.sys.dao.SysConfigDao;
import com.icloud.modules.sys.entity.SysConfigEntity;
import com.icloud.modules.sys.service.SysConfigService;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Map;

@Service("sysConfigService")
public class SysConfigServiceImpl extends ServiceImpl<SysConfigDao, SysConfigEntity> implements SysConfigService {

//    @Autowired
//	private SysConfigRedis sysConfigRedis;
	@Autowired
	private RedisService redisService;

	@Override
	public PageUtils queryPage(Map<String, Object> params) {
		String paramKey = (String)params.get("paramKey");

		IPage<SysConfigEntity> page = this.page(
			new Query<SysConfigEntity>().getPage(params),
			new QueryWrapper<SysConfigEntity>()
				.like(StringUtils.isNotBlank(paramKey),"param_key", paramKey)
				.eq("status", 1)
		);
		return new PageUtils(page);
	}
	
	@Override
	public void saveConfig(SysConfigEntity config) {
		this.save(config);
//		sysConfigRedis.saveOrUpdate(config);
		redisService.set(config.getParamKey(),config);
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void update(SysConfigEntity config) {
		this.updateById(config);
//		sysConfigRedis.saveOrUpdate(config);
		redisService.set(config.getParamKey(),config);
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void updateValueByKey(String key, String value) {
		baseMapper.updateValueByKey(key, value);
//		sysConfigRedis.delete(key);
		redisService.remove(key);
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public void deleteBatch(Long[] ids) {
		for(Long id : ids){
			SysConfigEntity config = this.getById(id);
//			sysConfigRedis.delete(config.getParamKey());
		}

		this.removeByIds(Arrays.asList(ids));
	}

	@Override
	public String getValue(String key) {
		Object obj = redisService.get(key);
//		SysConfigEntity config = sysConfigRedis.get(key);
		SysConfigEntity config = null;
		if(obj == null){
			config = baseMapper.queryByKey(key);
//			sysConfigRedis.saveOrUpdate(config);
			redisService.set(key,config);
		}else{
			config = (SysConfigEntity)obj;
		}
		return config == null ? null : config.getParamValue();
	}
	
	@Override
	public <T> T getConfigObject(String key, Class<T> clazz) {
		String value = getValue(key);
		if(StringUtils.isNotBlank(value)){
           return JSON.parseObject(value, clazz);
		}

		try {
			return clazz.newInstance();
		} catch (Exception e) {
			throw new BaseException("获取参数失败");
		}
	}
}
