var editor1;
KindEditor.ready(function(K) {
    editor1 = K.create('textarea[name="detail"]',{
            //参数配置
            width : '95%',
            filePostName: "file",
            uploadJson:  baseURL + "sys/oss/uploadFrontFoylay",
            minHeight: '450',
            resizeType : 0,//禁止拉伸，1可以上下拉伸，2上下左右拉伸
            filterMode: false,//true时过滤HTML代码，false时允许输入任何代码。
            itmes:  [
                'source', '|', 'undo', 'redo', '|', 'preview', 'print', 'template', 'code', 'cut', 'copy', 'paste',
                'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                'superscript', 'clearhtml', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image', 'multiimage',
                'flash', 'media', 'insertfile', 'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                'anchor', 'link', 'unlink', '|', 'about'
            ]
        }

    );
    //  prettyPrint();
});


$(function () {
    new AjaxUpload('#upload', {
        action: baseURL + "sys/oss/uploadFront",
        name: 'file',
        autoSubmit:true,
        responseType:"json",
        onSubmit:function(file, extension){
            if (!(extension && /^(jpg|jpeg|png|gif)$/.test(extension.toLowerCase()))){
                alert('只支持jpg、png、gif格式的图片！');
                return false;
            }
        },
        onComplete : function(file, r){
            console.log("r=="+JSON.stringify(r));
            console.log("file=="+file);
            if(r.code == 0){
                alert("上传成功!");
                // vm.optionSucai.localUrls = baseURL + r.url;
                // vm.sucai.list[vm.selectIndex].localUrls = baseURL + r.url;
                vm.smallSpu.img = r.url;
                console.log("vm.smallSpu.img=="+ vm.smallSpu.img);
                //vm.reload();
            }else{
                alert(r.msg);
            }
        }
    });
});



/**
 * 商品分类选择树
 * @type {{data: {simpleData: {idKey: string, enable: boolean, pIdKey: string, rootPId: number}, key: {url: string}}}}
 */
var setting = {
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "parentId",
            rootPId: -1
        },
        key: {
            url:"nourl"
        }
    }
};
var ztree;


/**
 * 店铺个性化分类选中树
 */
var sellCategorySetting = {
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "parentId",
            rootPId: -1
        },
        key: {
            url:"nourl"
        }
    }
};
var sellCategoryztree;

/**
 * 店铺选址数
 * @type {{data: {simpleData: {idKey: string, enable: boolean, pIdKey: string, rootPId: number}, key: {url: string}}}}
 */
var settingretail = {
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "parentId",
            rootPId: -1
        },
        key: {
            url:"nourl"
        }
    }
};
var retialztree;


$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'small/smallspu/list',
        datatype: "json",
        colModel: [			
			{ label: 'id', name: 'id', index: 'id', width: 50, key: true },
			{ label: '原价', name: 'price', index: 'price', width: 80 },
			{ label: '现价', name: 'originalPrice', index: 'original_price', width: 80 }, 			
			{ label: '商品名称', name: 'title', index: 'title', width: 80 },
			{ label: '销量', name: 'sales', index: 'sales', width: 80 },
            { label: '总库存', name: 'stock', index: 'stock', width: 80 },
            { label: '剩余库存', name: 'remainStock', index: 'remainStock', width: 80 },
            // { label: '分类id', name: 'categoryId', index: 'category_id', width: 80 },
            { label: '所属分类', name: 'smallCategory.title', index: 'category_id', width: 80 },
          /*  { label: '状态', name: 'status', width: 60, formatter: function(value, options, row){
                    return value === 0 ?
                        '<span class="label label-danger">下架</span>' :
                        '<span class="label label-success">上架</span>';
                }},*/
			// { label: '商户id', name: 'supplierId', index: 'supplier_id', width: 80 },
            { label: '所属零售户', name: 'shop.shopName', index: 'supplier_id', width: 80 },
            { label: '创建时间', name: 'createTime', index: 'create_time', width: 80 },
			{ label: '修改时间', name: 'modifyTime', index: 'modify_time', width: 80 }			
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
        // categoryId:0,
        addStock:null,//用于显示
        caculatRemainStock:null,
		smallSpu: {
            categoryId:null,
            smallCategory:{
                title:null
            },
            supplierId:null,
            shop:{
                shopName:null
            },
            sellcategoryId:null,
            smallSellCategory:{
                title:null
            }
        },
        skuList:[],//sku子商品列表
        attibutList:[],//商品属性
        user: {
            userId:null
        },//当前登陆用户
        deptId:null,//部门id(企业id)
        deptList:[],//部门列表（企业列表）
        deptName:'',

        q:{
            title:'',
            shopName:'',
            categoryTitle:'',
        }
	},

    watch: {
        addStock(newV,oldV) {
            // do something
            console.log(newV,oldV)
            var remainStock = vm.caculatRemainStock;//获取原来剩余库存，用于实时计算
            var pnewV = parseInt(newV);
            if(pnewV<0){
                vm.smallSpu.remainStock =  remainStock+pnewV>0?remainStock+pnewV:0;
            }else{
                vm.smallSpu.remainStock =  remainStock+pnewV;
            }
            vm.smallSpu.addStock = pnewV;
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
            vm.addStock = null;
			vm.smallSpu = {
                categoryId:null,
                smallCategory:{
                    title:null
                },
                retailerId:null,
                shop:{
                    shopName:null
                },
                sellcategoryId:null,
                smallSellCategory:{
                    title:null
                }

            };
            vm.deptName = '',
            vm.deptId = null,
            vm.getCategory();
            vm.getRetailList();
		},
		update: function (event) {
			var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            vm.addStock = null;
            vm.getInfo(id)

		},
		saveOrUpdate: function (event) {
            console.log("smallSpu1======"+JSON.stringify(vm.smallSpu))
            vm.smallSpu.detail=editor1.html();
            console.log("smallSpu2======"+JSON.stringify(vm.smallSpu))
            // return;
            //参数校验，
            if(vm.smallSpu.title==null || vm.smallSpu.title==''){
                layer.msg("商品名称不能为空", {icon: 2});
                return;
            }
            if(!priceCheck(vm.smallSpu.originalPrice)){
                layer.msg("商品原价不能为空,且为数字,最多保留两位小数", {icon: 2});
            }
            if(!priceCheck(vm.smallSpu.originalPrice)){
                layer.msg("商品现价不能为空,且为数字,最多保留两位小数", {icon: 2});
                return;
            }
            if(vm.smallSpu.categoryId==null || vm.smallSpu.categoryId==''){
                layer.msg("请选择分类", {icon: 2});
                return;
            }
            if(vm.smallSpu.supplierId==null || vm.smallSpu.supplierId=='' || vm.smallSpu.supplierId==0){
                layer.msg("请选择店铺", {icon: 2});
                return;
            }
		    $('#btnSaveOrUpdate').button('loading').delay(1000).queue(function() {
                var url = vm.smallSpu.id == null ? "small/smallspu/save" : "small/smallspu/update";
                // vm.smallSpu.detail = UE.getEditor('detail').getAllHtml();
                // vm.smallSpu.detail = UE.getEditor('detail').getContent();
                // vm.smallSpu.description =  UE.getEditor('description').getContent();
                console.log("vm.smallSpu==="+JSON.stringify(vm.smallSpu));
                $.ajax({
                    type: "POST",
                    url: baseURL + url,
                    contentType: "application/json",
                    data: JSON.stringify(vm.smallSpu),
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
                        url: baseURL + "small/smallspu/delete",
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
			$.get(baseURL + "small/smallspu/info/"+id, function(r){
                vm.smallSpu = r.smallSpu;
                console.log("smallSpu==="+JSON.stringify(vm.smallSpu));
                vm.caculatRemainStock = vm.smallSpu.remainStock;//设置剩余库存:只用于临时计算
                // ue.setHtml(r.smallSpu.detail);//设置富文本值
                // ue.setContent(r.smallSpu.detail);
                // ueDescription.setContent(r.smallSpu.description);
                // if(r.smallSpu.detail!=null && r.smallSpu.detail!=''){
                //     UE.getEditor('detail').setContent(r.smallSpu.detail);
                // }
                // if(r.smallSpu.description!=null && r.smallSpu.description!=''){
                //     UE.getEditor('description').setContent(r.smallSpu.description);
                // }
                editor1.html(vm.smallSpu.detail);
                vm.smallSpu.smallCategory = {
                    title:null
                };
                vm.smallSpu.shop = {
                    shopName:null
                };
                vm.smallSpu.smallSellCategory = {
                    title:null
                };

                //设置部门信息
                vm.deptId = r.smallSpu.deptId;
                vm.setDeptName(vm.deptId);

                //加载商品分类
                vm.getCategory();
                //加载零售户
                vm.getRetailList();
                //加载商户自定义分类
                vm.getSellCategory(vm.smallSpu.supplierId)//加载对应店铺的个性分类
                //加载sku列表
                vm.getSkuList(vm.smallSpu.id);
                //加载attribute列表
                vm.getAttibutList(vm.smallSpu.id);

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

        //加载分类树
        getCategory: function(){
            //加载分类树
            $.get(baseURL + "small/smallcategory/select?deptId="+vm.deptId, function(r){
                ztree = $.fn.zTree.init($("#categroyTree"), setting, r.categoryList);
                // console.log("ztree====="+JSON.stringify(ztree))
                var node = ztree.getNodeByParam("id", vm.smallSpu.categoryId);
                // console.log("加载node====="+JSON.stringify(node))
                if(node!=null){
                    ztree.selectNode(node);
                    vm.smallSpu.smallCategory.title = node.name;
                }
            })
        },
        categroyTree: function(){
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择分类",
                area: ['300px', '300px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#categroyLayer"),
                btn: ['确定', '取消'],
                btn1: function (index) {
                    var node = ztree.getSelectedNodes();
                    //选择分类
                    // console.log("node====="+JSON.stringify(node))
                    if(node!=null) {
                        if(node[0].id===0){
                            return;
                        }
                        vm.smallSpu.categoryId = node[0].id;
                        vm.smallSpu.smallCategory.title = node[0].name;
                    }
                    layer.close(index);
                }
            });
        },

        //加载零售户
        getRetailList: function(){
            //加载
            $.get(baseURL + "shop/shop/select?deptId="+vm.deptId, function(r){
                // console.log("r====="+JSON.stringify(r))
                retialztree = $.fn.zTree.init($("#retailTree"), settingretail, r.retailList);
                var node = retialztree.getNodeByParam("id", vm.smallSpu.supplierId);
                // console.log("加载node====="+JSON.stringify(node))
                if(node!=null){
                    retialztree.selectNode(node);
                    vm.smallSpu.shop.shopName = node.name;
                }
            })
        },
        //加载零售户
        retailTree: function(){
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择零售户",
                area: ['300px', '300px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#retailLayer"),
                btn: ['确定', '取消'],
                btn1: function (index) {
                    var node = retialztree.getSelectedNodes();
                    //选择
                    // console.log("node====="+JSON.stringify(node))
                    if(node!=null){
                        if(node[0].parentId===-1){
                            return;
                        }
                        vm.smallSpu.supplierId = node[0].id;
                        vm.smallSpu.shop.shopName = node[0].name;
                        //加载店铺对应的个性化商品分类
                        vm.getSellCategory(node[0].id);
                    }
                    layer.close(index);
                }
            });
        },

        //加载店铺个性化分类树
        getSellCategory: function(supplierId){
            //加载分类树
            $.get(baseURL + "small/smallsellcategory/select?supplierId="+supplierId, function(r){
                sellCategoryztree = $.fn.zTree.init($("#sellCategoryTree"), sellCategorySetting, r.list);
                // console.log("ztree====="+JSON.stringify(ztree))
                var node = sellCategoryztree.getNodeByParam("id", vm.smallSpu.sellcategoryId);
                // console.log("加载node====="+JSON.stringify(node))
                if(node!=null){
                    sellCategoryztree.selectNode(node);
                    vm.smallSpu.smallSellCategory.title = node.name;
                }
            })
        },
        sellcategroyTree: function(){
            layer.open({
                type: 1,
                offset: '50px',
                skin: 'layui-layer-molv',
                title: "选择个性化分类",
                area: ['300px', '300px'],
                shade: 0,
                shadeClose: false,
                content: jQuery("#sellCategoryLayer"),
                btn: ['确定', '取消'],
                btn1: function (index) {
                    var node = sellCategoryztree.getSelectedNodes();
                    //选择分类
                    // console.log("node====="+JSON.stringify(node))
                    if(node!=null){
                        vm.smallSpu.sellcategoryId = node[0].id;
                        vm.smallSpu.smallSellCategory.title = node[0].name;
                    }
                    layer.close(index);
                }
            });
        },
        //加载skulist
        getSkuList:function(spuId){
            $.get(baseURL + "small/smallsku/skulist?spuId="+spuId, function(r){
                if(r.code==0){
                    vm.skuList = r.list;
                }
            })
        },
        //打开添加sku弹窗
        addSku: function (title,id) {
		    if(id==''){
                id = null;
            }
            this.skuWin = layer.open({
                title: title!=null?title:'添加商品sku',
                type: 2,
                maxmin: true,
                move:true,
                shadeClose: true,
                area: ['85%', '85%'],
                btn: ['<i class="fa fa-check"></i> 确定', '<i class="fa fa-close"></i> 关闭'],
                content: baseURL + "modules/small/smallskuWin.html?spuId="+vm.smallSpu.id+"&id="+id,
                yes: function (index, layero) {
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    //加载sku列表
                    vm.getSkuList(vm.smallSpu.id);
                   /* var tArea = iframeWin.vm.tArea;
                    if($.trim(tArea.id) == '') {
                        layer.msg("请选择",{icon: 0,time: 1000});return;
                    }

                    console.log(tArea);
                    vm.tChargerStand.tArea.name = tArea.name;
                    vm.tChargerStand.areaId = tArea.id;*/
                    layer.close(index);
                },
                success: function (layero, index) {
                    /*var info = '<font color="red" class="pull-left mt10">提示：双击可快速选择。</font>';
                    layero.find('.layui-layer-btn').append(info);*/
                }
            });
        },
        //删除sku
        delSku:function (id) {
                if(id == null){
                    return ;
                }
                var ids = new Array();
                ids.push(id);
                var lock = false;
                layer.confirm('确定要删除选中的记录？', {
                    btn: ['确定','取消'] //按钮
                }, function(){
                    if(!lock) {
                        lock = true;
                        $.ajax({
                            type: "POST",
                            url: baseURL + "small/smallsku/delete",
                            contentType: "application/json",
                            data: JSON.stringify(ids),
                            success: function(r){
                                if(r.code == 0){
                                    layer.msg("操作成功", {icon: 1});
                                    vm.getSkuList(vm.smallSpu.id);
                                }else{
                                    layer.alert(r.msg);
                                }
                            }
                        });
                    }
                }, function(){

                });
        },

        //加载AttibutList
        getAttibutList:function(spuId){
            $.get(baseURL + "small/smallspuattribute/attibutList?spuId="+spuId, function(r){
                vm.attibutList = r.list;
            });
        },
        //添加编辑商品
        addAttribute:function (title,id) {
            if(id==''){
                id = null;
            }
            this.attributeWin = layer.open({
                title: title!=null?title:'添加商品属性',
                type: 2,
                maxmin: true,
                move:true,
                shadeClose: true,
                area: ['60%', '60%'],
                btn: ['<i class="fa fa-check"></i> 确定', '<i class="fa fa-close"></i> 关闭'],
                content: baseURL + "modules/small/smallspuattributeWin.html?spuId="+vm.smallSpu.id+"&id="+id,
                yes: function (index, layero) {
                    var iframeWin = window[layero.find('iframe')[0]['name']];
                    //加载
                    vm.getAttibutList(vm.smallSpu.id);
                    layer.close(index);
                },
                success: function (layero, index) {
                    /*var info = '<font color="red" class="pull-left mt10">提示：双击可快速选择。</font>';
                    layero.find('.layui-layer-btn').append(info);*/
                }
            });
        },
        //删除商品属性
        delAttribute:function (id) {
            if(id == null){
                return ;
            }
            var ids = new Array();
            ids.push(id);
            var lock = false;
            layer.confirm('确定要删除选中的记录？', {
                btn: ['确定','取消'] //按钮
            }, function(){
                if(!lock) {
                    lock = true;
                    $.ajax({
                        type: "POST",
                        url: baseURL + "small/smallspuattribute/delete",
                        contentType: "application/json",
                        data: JSON.stringify(ids),
                        success: function(r){
                            if(r.code == 0){
                                layer.msg("操作成功", {icon: 1});
                                vm.getAttibutList(vm.smallSpu.id);
                            }else{
                                layer.alert(r.msg);
                            }
                        }
                    });
                }
            }, function(){

            });
        },
        //加载企业列表
        getDeptList:function(){
            $.get(baseURL + "/sys/dept/selectlist", function(r){
                vm.deptList = r.deptList;
            });
        },
        //选择企业
        selectDept: function (index) {
            vm.smallSpu.deptId = vm.deptList[index].deptId;
            vm.deptName = vm.deptList[index].name;
            vm.deptId = vm.deptList[index].deptId;
            vm.getCategory();
            vm.getRetailList();
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


	}
});