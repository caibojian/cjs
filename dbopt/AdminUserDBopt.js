//数据操作
var models = require('../models');
var url = require('url');

var AdminUserDBopt = {
    //分页获取用户数据
    findUserByPages: function(req, res){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var keyPr = [];

        var params = url.parse(req.url,true);
        var startNum = (params.query.currentPage - 1)*params.query.limit + 1;
        var currentPage = Number(params.query.currentPage);
        var limit = Number(params.query.limit);
        var pageInfo;
         models.AdminUser.findAndCountAll({
            'include': [models.AdminGroup],
            'attributes': ['id', 'name', 'userName', 'email', 'phoneNum', 'comments', 'photo', 'auth', 'createdAt', 'updatedAt', 'AdminGroupId'],
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
    },
    //添加一个用户组
    addOne: function(req, res){
        models.AdminUser.create(req.body).then(function(){
            res.end('success');
        })
    },
    //根据条件查询
    findByAny: function(condition, callBack){
        models.AdminUser.findAll({ where: condition }).then(function(projects){
            callBack(projects)
        });
    },
    //删除一个用户
    del: function(req, res){
        var params = url.parse(req.url,true);
        models.AdminUser.destroy({
            where:{id : params.query.uid}
        }).then(function(){
            res.end('success');
        })
    },
    //更新一个用户
    updateById: function(req, res){
        var params = url.parse(req.url,true);
        var targetId = params.query.uid;
        models.AdminUser.update(
            req.body,{
            where:{
                id:targetId
            }
        }).then(function(){
            res.end('success');
        });
    },
     //查询一个用户
    findOne: function(req, res){
        var params = url.parse(req.url,true);
        models.AdminUser.findOne({
            where:{id : params.query.uid},
            attributes: ['id', 'name', 'userName', 'email', 'phoneNum', 'createdAt', 'updatedAt', 'AdminGroupId'],
        }).then(function(result){
            res.json(result);
        })
    },
}

module.exports = AdminUserDBopt;