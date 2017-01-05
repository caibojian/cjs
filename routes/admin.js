/**
 * 权限控制层
 * 对权限和参数做初次过滤
 */
var express = require('express');
var router = express.Router();
router.caseSensitive = true;
var url = require('url');
//数据校验
var validator = require('validator');
//对象管理
var adminBean = require('./adminBean');

//判断是否登录
function isAdminLogined(req){
    return req.session.adminlogined;
}

/*所有/admin请求都先到这里*/
router.get("/", function(req, res, next){
	if(isAdminLogined(req)){
		res.redirect("/admin/manage")
	}else{
		res.redirect("/admin/login");
	}
});
//管理页面请求
router.get(["/manage", "/manage/*"], function(req, res, next){
	if(isAdminLogined(req)){
		next();
	}else{
		res.redirect("/admin/login");
	}
});

//通用table数据查询
router.get('/manage/getDocumentList/:defaultUrl', function(req, res, next){
	var currentPage = req.params.defaultUrl;
	console.log(currentPage);
    if(adminBean.checkAdminPower(req,currentPage + '_view')){
        next();
    }else{
        return res.json({});
    }
});



//自定义校验扩展
validator.extend('isUserName', function (str) {
    return /^[a-zA-Z][a-zA-Z0-9_]{4,11}$/.test(str);
});

validator.extend('isGBKName', function (str) {
    return /[\u4e00-\u9fa5]/.test(str);
});

validator.extend('isPsd', function (str) {
    return /(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{5,}/.test(str);
});

validator.extend('isQQ', function (str) {
    return RegExp(/^[1-9][0-9]{4,9}$/).test(str);
});

//只能是英文
validator.extend('isEn', function (str) {
    return /^\S+[a-z A-Z]$/.test(str);
});

module.exports = router;