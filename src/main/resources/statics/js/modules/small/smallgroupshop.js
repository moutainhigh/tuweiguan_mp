$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'small/smallgroupshop/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			/*{ label: 'spuId', name: 'spuId', index: 'spu_id', width: 80 },
            { label: 'skuId', name: 'skuId', index: 'spu_id', width: 80 },*/
            { label: '商品图片', name: 'img', width: 60, formatter: function(value, options, row){
                    return '<img style="height: 3rem;width: 3rem;" src="'+value+'"/>';
                }},
            { label: '商品名称', name: 'title', index: 'title', width: 80 },
            { label: '现价', name: 'price', index: 'price', width: 80 },
			{ label: '原价', name: 'originalPrice', index: 'originalPrice', width: 80 },
			{ label: '剩余库存', name: 'remainStock', index: 'remainStock', width: 80 },
            { label: '店铺名称', name: 'shopName', index: 'shopName', width: 80 }

        ],
		viewrecords: true,
        height: 385,
        rowNum: 10,
		rowList : [10,30,50],
        rownumbers: true, 
        rownumWidth: 25, 
        autowidth:true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader : {
            root: "page.list",
            page: "page.currPage",
            total: "page.totalPage",
            records: "page.totalCount"
        },
        prmNames : {
            page:"page", 
            rows:"limit", 
            order: "order"
        },
        gridComplete:function(){
        	//隐藏grid底部滚动条
        	$("#jqGrid").closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" }); 
        }
    });
});

var vm = new Vue({
	el:'#icloudapp',
	data:{
		showList: true,
		title: null,
		smallGroupShop: {
            commonFlag:0
        },
        goodName:'',
        shopName:'',
        sysFlag:'0',//1系统店铺 0非系统店铺
        shopList:[],//店铺列表
        skuList :[],//对应店铺商品
        user: {
            userId:null
        },
        deptId:null,
        deptList:[],
        deptName:'',

        q:{
            title:'',
            shopName:''
        }
	},
    created: function(){
        this.getUser();
        this.getDeptList();
    },
	methods: {
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.smallGroupShop = {
                gmtStart:null,
                gmtEnd:null,
                commonFlag:0
            };
            vm.goodName='',
            vm.deptName = '',
            vm.deptId = null,
            vm.shopName = null;
            vm.getShopList();
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            
            vm.getInfo(id)
		},
		saveOrUpdate: function (event) {
		    $('#btnSaveOrUpdate').button('loading').delay(1000).queue(function() {
                var url = vm.smallGroupShop.id == null ? "small/smallgroupshop/save" : "small/smallgroupshop/update";
                $.ajax({
                    type: "POST",
                    url: baseURL + url,
                    contentType: "application/json",
                    data: JSON.stringify(vm.smallGroupShop),
                    success: function(r){
                        if(r.code === 0){
                             layer.msg("操作成功", {icon: 1});
                             vm.reload();
                             $('#btnSaveOrUpdate').button('reset');
                             $('#btnSaveOrUpdate').dequeue();
                        }else{
                            layer.alert(r.msg);
                            $('#btnSaveOrUpdate').button('reset');
                            $('#btnSaveOrUpdate').dequeue();
                        }
                    }
                });
			});
		},
		del: function (event) {
			var ids = getSelectedRows();
			if(ids == null){
				return ;
			}
			var lock = false;
            layer.confirm('确定要删除选中的记录？', {
                btn: ['确定','取消'] //按钮
            }, function(){
               if(!lock) {
                    lock = true;
		            $.ajax({
                        type: "POST",
                        url: baseURL + "small/smallgroupshop/delete",
                        contentType: "application/json",
                        data: JSON.stringify(ids),
                        success: function(r){
                            if(r.code == 0){
                                layer.msg("操作成功", {icon: 1});
                                $("#jqGrid").trigger("reloadGrid");
                            }else{
                                layer.alert(r.msg);
                            }
                        }
				    });
			    }
             }, function(){
             });
		},
		getInfo: function(id){
			$.get(baseURL + "small/smallgroupshop/info/"+id, function(r){
                vm.smallGroupShop = r.smallGroupShop;
                vm.shopName = r.smallGroupShop.shop.shopName;
                vm.goodName = r.smallGroupShop.sku.title;
                vm.deptId = r.smallGroupShop.deptId;
                vm.setDeptName(vm.deptId);
                vm.getShopList(r.smallGroupShop.supplierId);
            });
		},
		reload: function (event) {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{
                postData:vm.q,
                page: 1
            }).trigger("reloadGrid");
		},
        //加载AttibutList
        getShopList:function(id){
            $.get(baseURL + "shop/shop/selectlist?deptId="+vm.deptId, function(r){
                vm.shopList = r.list;
                if(id!=null && id!=''){
                    vm.setShopName(vm.smallGroupShop.supplierId);
                }
            });
        },
        //选择店铺
        selectShop: function (index) {
            vm.smallGroupShop.supplierId = vm.shopList[index].id;
            vm.shopName = vm.shopList[index].shopName;
            vm.getGoodsList(vm.shopList[index].id);//加载店铺sku列表
            vm.goodName = '';
            vm.sysFlag = vm.shopList[index].sysFlag;
            vm.smallGroupShop.spuId = null;
            vm.smallGroupShop.skuId = null;

        },
        setShopName:function(shopId){
            if(vm.shopList!=null && vm.shopList.length>0 && shopId!=null){
                vm.shopList.forEach(p=>{
                    if(p.id===shopId){
                        vm.shopName = p.shopName;
                    }
                });
            }
        },
        //选择自营或者公共商品
        selectCommonFlag: function (commonFlag) {
		    if(commonFlag==0){
		        vm.smallGroupShop.commonFlag = 0;
                //vm.getGoodsList(vm.smallGroupShop.supplierId,false);//加载店铺sku列表
            }else {
                vm.smallGroupShop.commonFlag = 1;
                //vm.getGoodsList(vm.smallGroupShop.supplierId,true);//加载店铺sku列表
            }
            vm.goodName = '';
            vm.smallGroupShop.spuId = null;
            vm.smallGroupShop.skuId = null;

        },
        //加载商品列表
        getGoodsList:function(supplierId,sysFlag){
            $.get(baseURL + "small/smallsku/skulistForGroup?supplierId="+supplierId+"&sysFlag="+sysFlag, function(r){
                vm.skuList = r.list;
            });
        },
        //选择sku
        selectSku_bak: function (index) {
		    var goods = vm.skuList[index];
            vm.goodName = goods.title;
            vm.smallGroupShop.spuId = goods.spuId;
            vm.smallGroupShop.skuId = goods.id;
            vm.smallGroupShop.minPrice = goods.price;//团购价
            vm.smallGroupShop.maxPrice = goods.originalPrice;//原价
        },
        //加载企业列表
        getDeptList:function(){
            $.get(baseURL + "/sys/dept/selectlist", function(r){
                vm.deptList = r.deptList;
            });
        },
        //选择企业
        selectDept: function (index) {
            vm.smallGroupShop.deptId = vm.deptList[index].deptId;
            vm.deptName = vm.deptList[index].name;
            vm.deptId = vm.deptList[index].deptId;
            vm.getShopList();
        },
        setDeptName:function(deptId){
            if(vm.deptList!=null && vm.deptList.length>0 && deptId!=null){
                vm.deptList.forEach(p=>{
                    if(p.deptId===deptId){
                        vm.deptName = p.name;
                    }
                });
            }
        },
        //获取用户信息
        getUser: function(){
            $.getJSON(baseURL+"sys/user/info?_"+$.now(), function(r){
                vm.user = r.user;
            });
        },
        //打开添加sku弹窗 选择需要上团购 是航拍
        selectSku: function () {
            if(vm.smallGroupShop.commonFlag===0){
                sysFlag = false;
            }else {
                sysFlag = true;
            }
            this.skuWinIndex = layer.open({
                title: '选择sku',
                type: 2,
                maxmin: true,
                move:true,
                shadeClose: true,
                area: ['65%', '65%'],
                btn: ['<i class="fa fa-check"></i> 确定', '<i class="fa fa-close"></i> 关闭'],
                content: baseURL + "modules/small/smallskuForGroup.html?supplierId="+vm.smallGroupShop.supplierId+"&sysFlag="+sysFlag,
                yes: function (index, layero) {
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    var smallSku = iframeWin.vm.smallSku;
                    console.log("smallSku====="+JSON.stringify(smallSku));
                    if($.trim(smallSku.id) == '') {
                        layer.msg("请选择sku",{icon: 0,time: 1000});return;
                    }

                    vm.goodName = smallSku.title;
                    vm.smallGroupShop.spuId = smallSku.spuId;
                    vm.smallGroupShop.skuId = smallSku.id;
                    vm.smallGroupShop.minPrice = smallSku.price;//团购价
                    vm.smallGroupShop.maxPrice = smallSku.originalPrice;//原价
                    console.log("vm.smallGroupShop====="+JSON.stringify(vm.smallGroupShop));
                    console.log("vm.goodName====="+JSON.stringify(vm.goodName));
                    layer.close(index);
                },
                success: function (layero, index) {
                    /*var info = '<font color="red" class="pull-left mt10">提示：双击可快速选择。</font>';
                    layero.find('.layui-layer-btn').append(info);*/
                }
            });
        },
        //选择商品弹出双击选中
        skuforgroupWinDblClick: function (smallSku) {
            vm.goodName = smallSku.title;
            vm.smallGroupShop.spuId = smallSku.spuId;
            vm.smallGroupShop.skuId = smallSku.id;
            vm.smallGroupShop.minPrice = smallSku.price;//团购价
            vm.smallGroupShop.maxPrice = smallSku.originalPrice;//原价
            console.log("vm.smallGroupShop====="+JSON.stringify(vm.smallGroupShop));
            console.log("vm.goodName====="+JSON.stringify(vm.goodName));
            layer.close(vm.skuWinIndex);
        },
	}
});
vm.getShopList();