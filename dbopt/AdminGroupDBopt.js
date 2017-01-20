//数据操作
var models = require('../models');
var url = require('url');

var AdminGroupDBopt = {
    //分页获取用户组数据
    findGroupByPages: function(req, res){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var keyPr = [];

        var params = url.parse(req.url,true);
        var startNum = (params.query.currentPage - 1)*params.query.limit + 1;
        var currentPage = Number(params.query.currentPage);
        var limit = Number(params.query.limit);
        var pageInfo;
         models.AdminGroup.findAndCountAll({
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
    //查询所有数据
    findGroupAll: function(req, res){
        models.AdminGroup.findAll({
            'attributes': ['id', 'name']
        }).then(function(projects) {
            return res.json(projects);
        }); 
    },
    //添加一个用户组
    addOne: function(req, res){
        models.AdminGroup.create(req.body).then(function(){
            res.end('success');
        })
    },
    //删除一个用户组
    del: function(req, res){
        var params = url.parse(req.url,true);
        models.AdminGroup.destroy({
            where:{id : params.query.uid}
        }).then(function(){
            res.end('success');
        })
    },
    //查询一个用户组
    findOne: function(req, res){
        var params = url.parse(req.url,true);
        models.AdminGroup.findOne({
            where:{id : params.query.uid}
        }).then(function(result){
            res.json(result);
        })
    },
    //更新一个用户组
    updateById: function(req, res){
        var params = url.parse(req.url,true);
        var targetId = params.query.uid;
        models.AdminGroup.update(
            req.body,{
            where:{
                id:targetId
            }
        }).then(function(){
            res.end('success');
        });
    }
}


module.exports = AdminGroupDBopt;