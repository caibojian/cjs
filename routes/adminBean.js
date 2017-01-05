/**
 * Created by cbj on 2016/1/5.
 *根据请求返回不同的对象进行处理
 */
var url = require('url');
var settings = require("../settings");
//数据库操作
var DBOpt = require("../models/DBOpt");
var AdminUser = require("../models/AdminUser");

var adminBean = {
	getTargetObj : function(currentPage){
        var targetObj;
        if(currentPage === settings.adminUsersList[0] ){
            targetObj = AdminUser;
        }

        return targetObj
    },

    checkAdminPower : function(req,key){
        var power = false;
        var uPower = req.session.adminPower;
        if(uPower){
            var newPowers = eval(uPower);
            for(var i=0;i<newPowers.length;i++) {
                var checkedId = newPowers[i].split(':')[0];
                if(checkedId == key && newPowers[i].split(':')[1]){
                    power = true;
                    break;
                }
            }
        }
        //return power;
        return true;
    },
    setQueryByArea : function(req,keyPr,targetObj,area){
        var newKeyPr = keyPr;
       
        return newKeyPr;
    },

}

module.exports = adminBean;