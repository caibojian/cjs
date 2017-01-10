
//初始化普通列表分页
function initPagination($scope,$http){
	console.log("初始化普通列表分页");
    $("#loading").modal();
    initPageInfo($scope);
    getPageInfos($scope,$http,"/admin/manage/getDocumentList/"+$('#currentCate').val(),'normalList');
}

function initPageInfo($scope){
    $("#loading").modal();
    $scope.selectPage = [
        {name:'10',value : '10'},
        {name:'20',value : '20'},
        {name:'30',value : '30'}
    ];
    $scope.limitNum = '10';
    $scope.currentPage = 1;
    $scope.totalPage = 1;
    $scope.totalItems = 1;
    $scope.limit = 10;
    $scope.pages = [];
    $scope.startNum = 1;
    $scope.keywords = $('#searchInput').val();
    $scope.area = $('#pageArea').val();
}


//翻页组件
function getPageInfos($scope,$http,url,reqType){

    // 定义翻页动作
    $scope.loadPage = function(page){
        $scope.currentPage = page;
        getPageInfos($scope,$http,url)
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.totalPage) {
            $scope.currentPage++;
            getPageInfos($scope,$http,url);
        }
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage--;
            getPageInfos($scope,$http,url);
        }
    };

    $scope.firstPage = function () {
        if ($scope.currentPage > 1) {
            $scope.currentPage = 1;
            getPageInfos($scope,$http,url);
        }
    };

    $scope.lastPage = function () {
        if ($scope.currentPage < $scope.totalPage) {
            $scope.currentPage = $scope.totalPage;
            getPageInfos($scope,$http,url);
        }
    };

    $scope.changeOption = function(){
        $scope.limit = Number($scope.limitNum);
        getPageInfos($scope,$http,url);
    };

    $http.get(url+"?limit="+$scope.limit+"&currentPage="+$scope.currentPage+"&searchKey="+$scope.keywords+"&area="+$scope.area).success(function(result){
        console.log("getData success!");
        if(reqType == 'normalList'){
            $scope.data = result.docs;
        }else if(reqType == 'themeShop'){
            $scope.themeShop = result.docs;
        }else{
            $scope.data = result.docs;
        }
        if(result.pageInfo){
            $scope.totalItems = result.pageInfo.totalItems;
            $scope.currentPage = result.pageInfo.currentPage;
            $scope.limit = result.pageInfo.limit;
            $scope.startNum = result.pageInfo.startNum;
            //获取总页数
            $scope.totalPage = Math.ceil($scope.totalItems / $scope.limit);

            var pageArr = [];
            var page_start = $scope.currentPage - 2 > 0 ? $scope.currentPage - 2 : 1;
            var page_end = page_start + 4 >= $scope.totalPage ? $scope.totalPage : page_start + 4;
            for(var i=page_start;i<=page_end;i++){
                pageArr.push(i);
            }
            $scope.pages = pageArr;

        }else{
            console.log("获取分页信息失败")
        }

        $("#dataLoading").addClass("hide");

    })
}

//angularJs https Post方法封装
function angularHttpPost($http,isValid,url,formData,callBack){
    //if(isValid){
    if(true){
        $http({
            method  : 'POST',
            url     : url,
            data    : $.param(formData),  // pass in data as strings
            headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
        })
        .success(function(data) {
            //  关闭所有模态窗口
            $('.am-modal').each(function(i){
                $(this).modal("close");
            });

            if(data == 'success'){
                callBack(data);
            }else{
                console.log(data);
                $("#my-alert").modal();
                $("#alert-modal-msg").text(data);
            }
        });
    }
    else{
        //$.tipsShow({ message : "参数校验不通过", type : 'warning' });
    }
}
//主要针对删除操作
function angularHttpGet($http,url,callBack){
    $http.get(url).success(function(result){
        $('.modal').each(function(i){
            $(this).modal("hide");
        });
        if(result == 'success'){
            callBack(result);
        }else{
            //$.tipsShow({ message : result, type : 'warning' });
        }
    })
}


//获取添加或修改链接
function getTargetPostUrl($scope,bigCategory){
    var url = "/admin/manage/"+bigCategory+"/addOne";
    if($scope.targetID){
        url = "/admin/manage/"+bigCategory+"/modify?uid="+$scope.targetID;
    }
    return url;
}


//初始化删除操作
function initDelOption($scope,$http,info){

    // 单条记录删除
    $scope.delOneItem = function(id){
        initCheckIfDo($scope,id,info,function(currentID){
            angularHttpGet($http,"/admin/manage/"+$('#currentCate').val()+"/del?uid="+id,function(){
                initPagination($scope,$http);
            });
        });
    };

    $scope.getNewIds = function(){
        getSelectIds();
    };

    // 批量删除
    $scope.batchDel = function(){
        var targetIds = $('#targetIds').val();
        if(targetIds && targetIds.split(',').length > 0){
            initCheckIfDo($scope,$('#targetIds').val(),info,function(currentID){
                angularHttpGet($http,"/admin/manage/"+$('#currentCate').val()+"/batchDel?ids="+currentID+"&expandIds="+$('#expandIds').val(),function(){
                    initPagination($scope,$http);
                });
            });
        }else{
            alert('请至少选择一项')
        }
    }

}

//提示用户操作窗口
function initCheckIfDo($scope,targetId,msg,callBack){
    $('#checkIfDo').on('open.modal.amui', function (event) {
        if(targetId){
            $scope.targetID = targetId;
        }
        $(this).find('.modal-msg').text(msg);
    }).on('close.modal.amui', function (event) {
        $scope.targetID ="";
    });
    $('#checkIfDo').modal({dimmer:true,
        relatedTarget: this,
        onConfirm: function(e) {
            callBack(targetId);
        },
        onCancel: function(e) {
        }
    });
}

//关闭模态窗口初始化数据
function clearModalData($scope,modalObj){
    $scope.formData = {};
    $scope.targetID = "";
    modalObj.find(".form-control").val("");
}
//获取用户组数据
function initGroups($scope,$http){
    $http.get("/admin/manage/sysTemManage_uGroup/findAll").success(function(result){
        if(result){
            $scope.groups = result;
        }else{
            console.log("获取分页信息失败")
        }
    });
}

//初始化管理员权限列表
function initPowerList($scope){
    var setting = {
        view: {
            selectedMulti: false
        },
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            beforeCheck: beforeCheck,
            onCheck: onCheck
        }
    };
    var zNodes = setAdminPowerTreeData();
  
    var code, log, className = "dark";
    function beforeCheck(treeId, treeNode) {
        className = (className === "dark" ? "":"dark");
        return (treeNode.doCheck !== false);
    }
    function onCheck(e, treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj("groupPowerTree"),
            checkedNodes = zTree.getCheckedNodes(true);
        var nodesArr = [];
        for(var i=0;i<checkedNodes.length;i++){
            var currentNode = checkedNodes[i];
            nodesArr.push(currentNode.id + ':' + true);
        }
        $scope.formData.power = nodesArr;
    }
    $.fn.zTree.init($("#groupPowerTree"), setting, zNodes);
}

//ztree 节点取消选中
function cancelTreeCheckBoxSelect(id){
    var treeObj = $.fn.zTree.getZTreeObj(id),
        checkedNodes = treeObj.getCheckedNodes(true);
    for (var i=0, l=checkedNodes.length; i < l; i++) {
        treeObj.checkNode(checkedNodes[i], false, true);
    }
}

//权限管理数据初始化
function setAdminPowerTreeData(){
    return [
        { id:'sysTemManage', pId:0, name:"系统管理", open:false},
        { id:'sysTemManage_user', pId:'sysTemManage', name:"系统用户管理", open:false},
        { id:'sysTemManage_user_add', pId:'sysTemManage_user', name:"新增"},
        { id:'sysTemManage_user_view', pId:'sysTemManage_user', name:"查看"},
        { id:'sysTemManage_user_modify', pId:'sysTemManage_user', name:"修改"},
        { id:'sysTemManage_user_del', pId:'sysTemManage_user', name:"删除"},

        { id:'sysTemManage_uGroup', pId:'sysTemManage', name:"系统用户组管理", open:false},
        { id:'sysTemManage_uGroup_add', pId:'sysTemManage_uGroup', name:"新增"},
        { id:'sysTemManage_uGroup_view', pId:'sysTemManage_uGroup', name:"查看"},
        { id:'sysTemManage_uGroup_modify', pId:'sysTemManage_uGroup', name:"修改"},
        { id:'sysTemManage_uGroup_del', pId:'sysTemManage_uGroup', name:"删除"},

        { id:'sysTemManage_ads', pId:'sysTemManage', name:"广告管理", open:false},
        { id:'sysTemManage_ads_add', pId:'sysTemManage_ads', name:"新增"},
        { id:'sysTemManage_ads_view', pId:'sysTemManage_ads', name:"查看"},
        { id:'sysTemManage_ads_modify', pId:'sysTemManage_ads', name:"修改"},
        { id:'sysTemManage_ads_del', pId:'sysTemManage_ads', name:"删除"},

        { id:'sysTemManage_files', pId:'sysTemManage', name:"文件管理", open:false},
        { id:'sysTemManage_files_view', pId:'sysTemManage_files', name:"查看"},
        { id:'sysTemManage_files_modify', pId:'sysTemManage_files', name:"修改"},
        { id:'sysTemManage_files_del', pId:'sysTemManage_files', name:"删除"},

        { id:'sysTemManage_data', pId:'sysTemManage', name:"数据管理", open:false},
        { id:'sysTemManage_data_1', pId:'sysTemManage_data', name:"数据备份", open:false},
        { id:'sysTemManage_data_1_view', pId:'sysTemManage_data_1', name:"查看"},
        { id:'sysTemManage_data_1_backup', pId:'sysTemManage_data_1', name:"执行备份"},
        { id:'sysTemManage_data_1_del', pId:'sysTemManage_data_1', name:"删除"},

        { id:'sysTemManage_logs', pId:'sysTemManage', name:"系统日志管理", open:false},
        { id:'sysTemManage_logs_view', pId:'sysTemManage_logs', name:"查看"},
        { id:'sysTemManage_logs_del', pId:'sysTemManage_logs', name:"删除"},

        { id:'contentManage', pId:0, name:"内容管理", open:false},
        { id:'contentManage_content', pId:'contentManage', name:"文档管理", open:false},
        { id:'contentManage_content_add', pId:'contentManage_content', name:"新增"},
        { id:'contentManage_content_view', pId:'contentManage_content', name:"查看"},
        { id:'contentManage_content_top', pId:'contentManage_content', name:"置顶"},
        { id:'contentManage_content_modify', pId:'contentManage_content', name:"修改"},
        { id:'contentManage_content_del', pId:'contentManage_content', name:"删除"},

        { id:'contentManage_cateGory', pId:'contentManage', name:"文档类别管理", open:false},
        { id:'contentManage_cateGory_add', pId:'contentManage_cateGory', name:"新增"},
        { id:'contentManage_cateGory_view', pId:'contentManage_cateGory', name:"查看"},
        { id:'contentManage_cateGory_modify', pId:'contentManage_cateGory', name:"修改"},
        { id:'contentManage_cateGory_del', pId:'contentManage_cateGory', name:"删除"},

        { id:'contentManage_tag', pId:'contentManage', name:"文档标签管理", open:false},
        { id:'contentManage_tag_add', pId:'contentManage_tag', name:"新增"},
        { id:'contentManage_tag_view', pId:'contentManage_tag', name:"查看"},
        { id:'contentManage_tag_modify', pId:'contentManage_tag', name:"修改"},
        { id:'contentManage_tag_del', pId:'contentManage_tag', name:"删除"},

        { id:'contentManage_temp', pId:'contentManage', name:"文档模板管理", open:false},
        { id:'contentManage_temp_1', pId:'contentManage_temp', name:"模板配置", open:false},
        { id:'contentManage_temp_1_add', pId:'contentManage_temp_1', name:"模板安装"},
        { id:'contentManage_temp_1_import', pId:'contentManage_temp_1', name:"安装本地模板"},
        { id:'contentManage_temp_1_view', pId:'contentManage_temp_1', name:"查看"},
        { id:'contentManage_temp_1_modify', pId:'contentManage_temp_1', name:"模板启动"},
        { id:'contentManage_temp_1_del', pId:'contentManage_temp_1', name:"模板卸载"},
        { id:'contentManage_tpItem_add', pId:'contentManage_temp_1', name:"添加模板单元"},
        { id:'contentManage_tpItem_del', pId:'contentManage_temp_1', name:"删除模板单元"},

        { id:'contentManage_temp_2', pId:'contentManage_temp', name:"模板编辑", open:false},
        { id:'contentManage_temp_2_view', pId:'contentManage_temp_2', name:"查看"},
        { id:'contentManage_temp_2_modify', pId:'contentManage_temp_2', name:"修改"},

        { id:'contentManage_msg', pId:'contentManage', name:"留言管理", open:false},
        { id:'contentManage_msg_view', pId:'contentManage_msg', name:"查看"},
        { id:'contentManage_msg_add', pId:'contentManage_msg', name:"回复"},
        { id:'contentManage_msg_del', pId:'contentManage_msg', name:"删除"},

        { id:'contentManage_notice', pId:'contentManage', name:"消息管理", open:true},
        { id:'contentManage_notice_1', pId:'contentManage_notice', name:"公告管理", open:true},
        { id:'contentManage_notice_1_add', pId:'contentManage_notice_1', name:"新增"},
        { id:'contentManage_notice_1_view', pId:'contentManage_notice_1', name:"查看"},
        { id:'contentManage_notice_1_modify', pId:'contentManage_notice_1', name:"修改"},
        { id:'contentManage_notice_1_del', pId:'contentManage_notice_1', name:"删除"},

        { id:'contentManage_notice_2', pId:'contentManage_notice', name:"用户消息", open:false},
        { id:'contentManage_notice_2_view', pId:'contentManage_notice_2', name:"查看"},
        { id:'contentManage_notice_2_del', pId:'contentManage_notice_2', name:"删除"},

        { id:'contentManage_notice_3', pId:'contentManage_notice', name:"系统消息", open:false},
        { id:'contentManage_notice_3_view', pId:'contentManage_notice_3', name:"查看"},
        { id:'contentManage_notice_3_modify', pId:'contentManage_notice_3', name:"标记已读"},
        { id:'contentManage_notice_3_del', pId:'contentManage_notice_3', name:"删除"},

        { id:'userManage', pId:0, name:"会员管理", open:false},
        { id:'userManage_user', pId:'userManage', name:"注册用户管理", open:false},
        { id:'userManage_user_view', pId:'userManage_user', name:"查看"},
        { id:'userManage_user_modify', pId:'userManage_user', name:"修改"},
        { id:'userManage_user_del', pId:'userManage_user', name:"删除"}

    ]
}


