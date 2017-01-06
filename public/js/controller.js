/**
 * Created by cbj on 2016/1/5.
 * cjs自定义控制器
 */

 var cjsApp = angular.module('adminApp', []);

 cjsApp.factory('pageData',function(){
    return {
        bigCategory : $("#currentCate").val()
    }
});

cjsApp.factory('getItemService',['$http',function($http){
    //获取单个对象信息
    var getItemRequest = function(currentPage,targetId){
        var requestPath = "/admin/manage/"+currentPage+"/item?uid="+targetId;
        return $http.get(requestPath)
    };
    return {
        itemInfo : function(currentPage,targetId){
            return getItemRequest(currentPage,targetId);
        }
    }
}]);

 //管理员用户列表
 cjsApp.controller("adminUserList",['$scope','$http','pageData','getItemService',
 	function($scope,$http,pageData,getItemService){
		$scope.formData = {};
    	//获取管理员列表信息
    	initPagination($scope,$http);
        //删除用户
        initDelOption($scope,$http,'您确认要删除选中的管理员吗？');
        // 修改用户
        $('#addNewAdminUser').on('open.modal.amui', function (event) {
            console.log("弹出框");
            // var obj = $(event.relatedTarget);
            // var editId = obj.data('whatever');
            // // 如果不为空则为编辑状态
            // if(editId){
            //     getItemService.itemInfo(pageData.bigCategory,editId).success(function(result){
            //         $scope.formData = result;
            //         $scope.targetID = editId;
            //         initTreeDataByType($scope,$http,'adminGroup');
            //     })
            // }else{
            //     $scope.formData = {};
            //     initTreeDataByType($scope,$http,'adminGroup');
            // }

        }).on('close.modal.amui', function (e) {
            console.log("关闭弹出框");
            // 清空数据
            // clearModalData($scope,$(this));
        });

         //添加新用户或修改用户
        $scope.processForm = function(isValid){
            if(false){
            //if(!$scope.formData.group){
                // $.tipsShow({
                //     message : '请选择用户组',
                //     type : 'warning' ,
                //     callBack : function(){
                //         return;
                //     }
                // });
            }else{
                angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
                    initPagination($scope,$http);
                });
            }

        };
}]);
