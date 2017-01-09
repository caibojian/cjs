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
//短id
var shortid = require('shortid');

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
    if(adminBean.checkAdminPower(req,currentPage + '_view')){
        next();
    }else{
        return res.json({});
    }
});

//获取多有对象
router.get('/manage/:defaultUrl/findAll', function(req, res, next){
    var currentPage = req.params.defaultUrl;
    if(adminBean.checkAdminPower(req,currentPage + '_view')){
        next();
    }else{
        return res.json({});
    }
});

//对象新增
router.post('/manage/:defaultUrl/addOne',function(req,res,next){

    var currentPage = req.params.defaultUrl;
    if(adminBean.checkAdminPower(req,currentPage + '_add')){
        next();
    }else{
        res.end(settings.system_noPower);
    }
});

//更新单条记录(执行更新)
router.post('/manage/:defaultUrl/modify',function(req,res,next){
    var currentPage = req.params.defaultUrl;
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;
    if(adminBean.checkAdminPower(req,currentPage + '_modify')){
        if(shortid.isValid(targetId)){
            next();
        }else{
            res.end(settings.system_illegal_param);
        }
    }else{
        res.end(settings.system_noPower);
    }
});

//通用对象删除
router.get('/manage/:defaultUrl/del',function(req,res,next){
    var currentPage = req.params.defaultUrl;
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;
    if(adminBean.checkAdminPower(req,currentPage + '_del')){
        if(shortid.isValid(targetId)){
            next();
        }else{
            res.end(settings.system_illegal_param);
        }

    }else{
        res.end(settings.system_noPower);
    }
});

//获取单个对象数据
router.get('/manage/:defaultUrl/item',function(req,res,next){
    var currentPage = req.params.defaultUrl;
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;
    if(adminBean.checkAdminPower(req,currentPage + '_view')){
        if(shortid.isValid(targetId)){
            next();
        }else{
            res.end(settings.system_illegal_param);
        }
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