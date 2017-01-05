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

mongoose.connect(settings.URL);
var db = mongoose.connection;
 //mongoose.connect('mongodb://'+settings.USERNAME+':'+settings.PASSWORD+'@'+settings.HOST+':'+settings.PORT+'/'+settings.DB+'');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  	console.log("连接mongodb");
  	//初始化管理员用户信息
	//验证用户名密码
    AdminUser.findOne({'userName': 'admin', 'password': 'password'}).exec(function(err, user){
        if(err){
            console.log("初始化管理员用户信息失败");
        }
        if(user){
           	console.log("管理员用户已存在");
        }else{
			console.log("管理员用户不存在");
			var adminuser = new AdminUser();
			adminuser.userName = 'admin';
			adminuser.password = 'password';
			adminuser.name = '超级管理员'
			adminuser.save(function(err){
				if(err){
	                console.log("初始化管理员用户信息失败");
	            }else{
	                console.log("初始化管理员用户信息成功");
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
};

module.exports = DBOpt;