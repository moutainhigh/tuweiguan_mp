$(function () {
    $("#jqGrid").jqGrid({
        url: baseURL + 'small/orderreport/monthlist',
        datatype: "json",
        colModel: [
            { label: '日期', name: 'createTime', index: 'createTime', width: 80 },
			{ label: '订单总数', name: 'orderCount', index: 'orderCount', width: 80 },
			{ label: '金额', name: 'orderAmout', index: 'orderAmout', width: 80 },
            { label: '店铺名称', name: 'shopName', index: 'shopName', width: 80 },
            {header:'操作', name:'操作', width:50, sortable:false, title:false, align:'center', formatter: function(val, obj, row, act){
                    var actions = [];
                    actions.push('<a title="查询明细" onclick="vm.update('+row.id+')"><i class="fa fa-pencil">查询明细</i></a>&nbsp;');
                    return actions.join('');
                }}
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
        yearlist:[],
        monthlist:[],
        q:{
            shopName:'',
        }
	},
	methods: {
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.smallProvider = {};
		},
		update: function (id) {
			//var id = getSelectedRow();
			if(id == null){
				return ;
			}
			vm.showList = false;
            vm.title = "修改";
            
            //vm.getInfo(id)
		},
		saveOrUpdate: function (event) {
		    $('#btnSaveOrUpdate').button('loading').delay(1000).queue(function() {
                var url = vm.smallProvider.id == null ? "small/smallprovider/save" : "small/smallprovider/update";
                $.ajax({
                    type: "POST",
                    url: baseURL + url,
                    contentType: "application/json",
                    data: JSON.stringify(vm.smallProvider),
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
                        url: baseURL + "small/smallprovider/delete",
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
			$.get(baseURL + "small/smallprovider/info/"+id, function(r){
                vm.smallProvider = r.smallProvider;
            });
		},
        getyearlist: function(){
            $.get(baseURL + "small/orderreport/yearlist", function(r){
                console.log("yearlist===="+JSON.stringify(r));
                vm.yearlist = r.yearlist;
                vm.monthlist = r.monthlist;
            });
        },
		reload: function (event) {
			vm.showList = true;
			var page = $("#jqGrid").jqGrid('getGridParam','page');
			$("#jqGrid").jqGrid('setGridParam',{
                postData:vm.q,
                page: 1
            }).trigger("reloadGrid");
		}
	}
});
vm.getyearlist();