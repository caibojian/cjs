var express = require('express');
var router = express.Router();
router.caseSensitive = true;
var url = require('url');
//数据校验
var validator = require('validator');

/*跳转到到登录页面*/
router.get("/login", function(req, res, net){
	res.render('admin/login');
});
//管理主界面
router.get('/manage', function(req, res) {
    res.render('admin/homePage', setPageInfo(req,res,['sysTemManage','DoraCMS后台管理']));
});

/*处理登录请求*/
router.post('/doLogin', function(req, res){
	var userName = req.body.userName;
	var password = req.body.password;
	if(true){
		if(validator.isUserName(userName) && validator.isPsd(password)){
			req.session.adminlogined = true;
			res.end("success");
		}
	}else{
		console.log("登录失败");
		res.end("用户名或密码错误");
	}
});

// 管理员退出
router.get('/logout', function(req, res) {
    req.session.adminlogined = false;
    req.session.adminPower = '';
    req.session.adminUserInfo = '';
    res.redirect("/admin");
});

function setPageInfo(req,res,module){

    var searchKey = '';
    //area是为了独立查询一个表其中的部分数据而设立的参数
    var area = '';
    if(req.url){
        var params = url.parse(req.url,true);
        searchKey = params.query.searchKey;
        area = req.query.area;
    }

    return {
        siteInfo : module[1],
        bigCategory : module[0],
        searchKey : searchKey,
        area : area,
        currentLink : req.originalUrl,
        layout : 'admin/index'
    }

}
module.exports = router;