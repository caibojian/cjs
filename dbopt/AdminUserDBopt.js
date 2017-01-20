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
    },
}


module.exports = AdminUserDBopt;