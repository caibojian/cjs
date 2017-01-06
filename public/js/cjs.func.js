
//初始化普通列表分页
function initPagination($scope,$http){
	console.log("初始化普通列表分页");
    initPageInfo($scope);
    getPageInfos($scope,$http,"/admin/manage/getDocumentList/"+$('#currentCate').val(),'normalList');
}

function initPageInfo($scope){
    $("#dataLoading").removeClass("hide");
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
            // $('.modal').each(function(i){
            //     $(this).modal("hide");
            // });

            if(data == 'success'){
                callBack(data);
            }else{
                //$.tipsShow({ message : data, type : 'warning' });
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
        // initCheckIfDo($scope,id,info,function(currentID){
            angularHttpGet($http,"/admin/manage/"+$('#currentCate').val()+"/del?uid="+id,function(){
                initPagination($scope,$http);
            });
        // });
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


