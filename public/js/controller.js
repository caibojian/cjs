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
 }]);
