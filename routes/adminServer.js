var express = require('express');
var router = express.Router();
router.caseSensitive = true;
var url = require('url');
var pass = require('../utils/pass');
var log = require('log4js').getLogger("adminServer");
//站点配置
var settings = require("../settings");
//数据校验
var validator = require('validator');
//对象管理
var adminBean = require('./adminBean');
//数据操作
var models = require('../models');
//密码加密
var pass = require('../utils/pass');

/*跳转到到登录页面*/
router.get("/login", function(req, res, net){
	res.render('admin/login');
});
//管理主界面
router.get('/manage', function(req, res) {
    res.render('admin/homePage', setPageInfo(req,res,settings.SYSTEMMANAGE));
});
//人员管理界面
router.get('/manage/userMge', function(req, res) {
    res.render('admin/userMge', setPageInfo(req,res,settings.adminUsersList));
});
//用户组管理界面
router.get('/manage/groupMge', function(req, res) {
    res.render('admin/groupMge', setPageInfo(req,res,settings.adminGroupList));
});
//实时日志界面
router.get('/manage/loging', function(req, res) {
    res.render('admin/loging', setPageInfo(req,res,settings.adminLoging));
});
//系统状态界面
router.get('/manage/netdata', function(req, res) {
    res.render('admin/netdatatv', setPageInfo(req,res,settings.adminNetdata));
});
/*处理登录请求*/
router.post('/doLogin', function(req, res){
	var userName = req.body.userName;
	var password = req.body.password;
	if(true){
		if(validator.isUserName(userName) && validator.isPsd(password)){
            models.AdminUser.findOne({
                include: [models.AdminGroup],
                where :{
                  userName: userName
                }
            }).then(function(result){
                if(result){
                   pass.hash(password, result.salt, function(err, hash){
                        console.log(result.password);
                        console.log(hash);
                        if(result.password == hash){
                            req.session.adminlogined = true;
                            req.session.adminUserInfo = result;
                            req.session.adminPower = result.AdminGroup.power;
                            res.end("success");
                            log.info('登录成功');
                        }else{
                            console.log("登录失败");
                            res.end("用户名或密码错误"); 
                        }
                    }); 
                }
            })
		}else{
            console.log("登录失败");
            res.end("用户名或密码错误");
        }
	}
});

// 管理员退出
router.get('/logout', function(req, res) {
    req.session.adminlogined = false;
    req.session.adminPower = '';
    req.session.adminUserInfo = '';
    res.redirect("/admin");
});

//-------------------------获取单个对象数据开始-------------------------
router.get('/manage/:defaultUrl/item',function(req,res){
    var currentPage = req.params.defaultUrl;
    var targetObj = adminBean.getTargetObj(currentPage);
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;

    if(targetObj == AdminUser){
        AdminUser.getOneItem(res,targetId,function(user){
            user.password = "";
            return res.json(user);
        });
    }else{
        DBOpt.findOne(targetObj,req, res,"find one obj success");
    }

});

//-------------------------获取单个对象数据结束-------------------------


//-------------------------对象列表查询开始(带分页)-------------------------------

router.get('/manage/getDocumentList/:defaultUrl',function(req,res){
    var targetObj = adminBean.getTargetObj(req.params.defaultUrl);
    var params = url.parse(req.url,true);
    console.log(params);
    var keywords = params.query.searchKey;
    var area = params.query.area;
    var keyPr = [];

    var params = url.parse(req.url,true);
    var startNum = (params.query.currentPage - 1)*params.query.limit + 1;
    var currentPage = Number(params.query.currentPage);
    var limit = Number(params.query.limit);
    var pageInfo;

//    根据条件查询记录(如果有条件传递，则按条件查询)
    var query;
    
    if(targetObj == "AdminUser"){
        models.AdminUser.findAndCountAll({
            'include': [models.AdminGroup],
            'attributes': ['id', 'name', 'userName', 'email', 'phoneNum', 'comments', 'createtime', 'photo', 'auth', 'createdAt', 'updatedAt', 'AdminGroupId'],
            limit: startNum + limit -1,
            offset: startNum -1
        }).then(function(result){
            pageInfo = {
                    "totalItems" : result.count,
                    "currentPage" : currentPage,
                    "limit" : limit,
                    "startNum" : Number(startNum)
                };

            return res.json({
                docs : result.rows,
                pageInfo : pageInfo
            });
        })
    }else{

    }

});


//-------------------------对象列表查询结束(带分页)-------------------------------

//-------------------------对象删除开始-------------------------

router.get('/manage/:defaultUrl/del',function(req,res){
    var currentPage = req.params.defaultUrl;
    var params = url.parse(req.url,true);
    var targetObj = adminBean.getTargetObj(currentPage);

    if(targetObj == AdminUser){
        if(params.query.uid == req.session.adminUserInfo._id){
            res.end('不能删除当前登录的管理员！');
        }else{
            DBOpt.del(targetObj,req,res,"del one obj success");
        }
    }else if(targetObj == AdminGroup){
        // if(params.query.uid == req.session.adminUserInfo.group._id){
        //     res.end('当前用户拥有的权限信息不能删除！');
        // }else{
            DBOpt.del(targetObj,req,res,"del one obj success");
        // }
    }else{
        DBOpt.del(targetObj,req,res,"del one obj success");
    }

});

//批量删除对象
// router.get('/manage/:defaultUrl/batchDel',function(req,res){
//     var currentPage = req.params.defaultUrl;
//     var params = url.parse(req.url,true);
//     var targetObj = adminFunc.getTargetObj(currentPage);
//     var ids = params.query.ids;
//     var idsArr = ids.split(',');
//     if(targetObj == Message || targetObj == AdminGroup || targetObj == AdminUser || targetObj == Notify){
//         res.end(settings.system_batch_delete_not_allowed);
//     }else if(targetObj == UserNotify){
//         //管理员删除系统消息
//         if(currentPage == settings.sysTemBackStageNotice[0]){
//             var nids = params.query.expandIds;
//             var nidsArr = nids.split(',');
//             if(nidsArr.length > 0){
//                 for(var i=0;i<nidsArr.length;i++){
//                     adminFunc.delNotifiesById(req,res,nidsArr[i]);
//                 }
//                 //更新消息数
//                 adminFunc.getAdminNotices(req,res,function(noticeObj){
//                     req.session.adminNotices = noticeObj;
//                     res.end('success');
//                 });
//             }
//         }
//     }else{
//         targetObj.remove({'_id':{$in: idsArr}},function(err){
//             if(err){
//                 res.end(err);
//             }else{
//                 res.end("success");
//             }
//         });

//     }

// });

//-------------------------对象删除结束-------------------------

//-------------------------更新单条记录(执行更新)开始--------------------
router.post('/manage/:defaultUrl/modify',function(req,res){
    var currentPage = req.params.defaultUrl;
    var targetObj = adminBean.getTargetObj(currentPage);
    var params = url.parse(req.url,true);

    if(targetObj == AdminUser){
        // req.body.password = DbOpt.encrypt(req.body.password,settings.encrypt_key);
        pass.hash(req.body.password, function(err, salt, hash){
            req.body.password = hash;
            req.body.salt = salt;
            DBOpt.updateOneByID(targetObj,req, res,"update one obj success")
        });
        
    }
    DBOpt.updateOneByID(targetObj,req, res,"update one obj success")
});
//-------------------------更新单条记录(执行更新)结束--------------------

//-------------------------获取所有数据开始--------------------
router.get('/manage/:defaultUrl/findAll',function(req,res){
    var currentPage = req.params.defaultUrl;
    var targetObj = adminBean.getTargetObj(currentPage);
    var params = url.parse(req.url,true);
    DBOpt.findAll(targetObj,req, res,"findAll one obj success")
});
//-------------------------获取所有数据结束--------------------
//-------------------------对象新增开始-------------------------
router.post('/manage/:defaultUrl/addOne',function(req,res){

    var currentPage = req.params.defaultUrl;
    var targetObj = adminBean.getTargetObj(currentPage);

    if(targetObj == AdminUser){
        addOneAdminUser(req,res);
    }else{
        DBOpt.addOne(targetObj,req, res);
    }

});

//-------------------------对象新增结束-------------------------

//添加系统用户
function addOneAdminUser(req,res){
    var errors;
    var userName = req.body.userName;
    if(validator.isUserName(userName)){
        AdminUser.findOne({userName:req.body.userName},function(err,user){
            if(user){
                errors = "该用户名已存在！";
                res.end(errors);
            }else{
                // if(!req.body.group){
                //     errors = "请选择用户组！";
                // }
                if(errors){
                    res.end(errors)
                }else{
                    // 密码加密
                    //req.body.password = DbOpt.encrypt(req.body.password,settings.encrypt_key);
                    //req.body.group = new AdminGroup({_id : req.body.group});
                    pass.hash(req.body.password, function(err, salt, hash){
                        req.body.password = hash;
                        req.body.salt = salt;
                        DBOpt.addOne(AdminUser,req, res);
                    });
                }
            }
        })
    }else{
        res.end(settings.system_illegal_param)
    }

}


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