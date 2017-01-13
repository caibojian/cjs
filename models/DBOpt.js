/**
 *Created by cbj on 2017/1/4.
 *mongodb数据库操作
 **/
var url = require('url');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var settings = require('../settings');
//后台管理用户
var AdminUser = require('../models/AdminUser');
var AdminGroup = require('../models/AdminGroup');
//短id
var shortid = require('shortid');
//密码加密
var pass = require('../utils/pass');

mongoose.connect(settings.URL);
var db = mongoose.connection;
 //mongoose.connect('mongodb://'+settings.USERNAME+':'+settings.PASSWORD+'@'+settings.HOST+':'+settings.PORT+'/'+settings.DB+'');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  	console.log("连接mongodb");
  	//初始化管理员用户信息
	//验证用户名密码
    AdminUser.findOne({'userName': 'admin'}).exec(function(err, user){
        if(err){
            console.log("初始化管理员用户信息失败");
        }
        if(user){
           	console.log("管理员用户已存在");
        }else{
            var groupID = shortid.generate();
            var adminGroup = new AdminGroup();
            adminGroup.name = '管理员';
            adminGroup._id = groupID;
            adminGroup.power = settings.system_Power;
            adminGroup.save(function(eer){
                if(err){
                    console.log("初始化管理员用户组信息失败");
                }else{
                    console.log("初始化管理员用户组信息成功");
                    console.log("管理员用户不存在");
                    var adminuser = new AdminUser();
                    adminuser.userName = 'admin';
                    adminuser.group = groupID;
                    adminuser.name = '超级管理员'
                    pass.hash('password',function(err, salt, hash){
                        adminuser.password = hash;
                        adminuser.salt = salt;
                        adminuser.save(function(err){
                            if(err){
                                console.log("初始化管理员用户信息失败");
                            }else{
                                console.log("初始化管理员用户信息成功");
                            }
                        });
                    });
                }
            });
			
        }
    });
});
//数据库操作
var DBOpt = {
	addOne : function(obj,req,res){
        var newObj = new obj(req.body);
        newObj.save(function(err){
            if(err){
                res.end(err);
            }else{
                res.end("success");
            }
        });
    },
    pagination : function(obj,req,res,conditions){
        var params = url.parse(req.url,true);
        var startNum = (params.query.currentPage - 1)*params.query.limit + 1;
        var currentPage = Number(params.query.currentPage);
        var limit = Number(params.query.limit);
        var pageInfo;

//    根据条件查询记录(如果有条件传递，则按条件查询)
        var query;
        if(conditions && conditions.length > 1){
            query=obj.find().or(conditions);
        }
        else if(conditions){
            query=obj.find(conditions);
        }
        else{
            query=obj.find({});
        }
        query.sort({'date': -1});

        // if(obj === Message){
        //     query.populate('author').populate('replyAuthor').populate('adminAuthor');
        // }else if(obj === AdminUser){
        //     //query.populate('group');
        // }else if(obj === UserNotify){
        //     query.populate('user').populate('notify');
        // }

        if(obj === AdminUser){
            query.populate('group');
        }
        query.exec(function(err,docs){
            if(err){
                console.log(err)

            }else {
                pageInfo = {
                    "totalItems" : docs.length,
                    "currentPage" : currentPage,
                    "limit" : limit,
                    "startNum" : Number(startNum)
                };

                return res.json({
                    docs : docs.slice(startNum - 1,startNum + limit -1),
                    pageInfo : pageInfo
                });
            }
        })
    },
    del : function(obj,req,res,logMsg){
        var params = url.parse(req.url,true);
        var targetId = params.query.uid;
        if(shortid.isValid(targetId)){
            obj.remove({_id : params.query.uid},function(err,result){
                if(err){
                    res.end(err);
                }else{
                    console.log(logMsg+" success!");
                    res.end("success");
                }
            })
        }else{
            res.end(settings.system_illegal_param);
        }
    },
    updateOneByID : function(obj,req,res,logMsg){
        var params = url.parse(req.url,true);
        var targetId = params.query.uid;

        if(shortid.isValid(targetId)){
            var conditions = {_id : targetId};
            req.body.updateDate = new Date();
            var update = {$set : req.body};
            obj.update(conditions, update, function (err,result) {
                if(err){
                    res.end(err);
                }else{
                    console.log(logMsg+" success!");
                    res.end("success");
                }
            })
        }else{
            res.end(settings.system_illegal_param);
        }
    },
    findOne : function(obj,req,res,logMsg){ //根据ID查找单条记录
        var params = url.parse(req.url,true);
        var targetId = params.query.uid;
        if(shortid.isValid(targetId)){
            obj.findOne({_id : targetId}, function (err,result) {
                if(err){
                    res.next(err);
                }else{
                    console.log(logMsg+" success!");
                    return res.json(result);
                }
            })
        }else{
            res.end(settings.system_illegal_param);
        }

    },
    findAll : function(obj,req,res,logMsg){//查找指定对象所有记录
        obj.find({}, function (err,result) {
            if(err){
                res.next(err);
            }else{
                console.log(logMsg+" success!");
                return res.json(result);
            }
        })
    },
};

module.exports = DBOpt;