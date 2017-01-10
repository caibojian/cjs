/**
 * Created by cbj on 2017/1/10.
 * 系统操作日志
 */
 var mongoose = require('mongoose');
 var shortid = require('shortid');
 var Schema = mongoose.Schema;

 var SystemLogSchema = new Schema({
 	_id: {
 		type: String,
 		unique: true,
 		'default': shortid.generate
 	},
 	type: String,
 	date: {type: Date, default: Date.now},
 	logs: String
 });

 SystemLogSchema.statics = {
 	//添加用户登录日志
 	addLoginLogs : function(req, res, tragetIp){
 		var loginLog = new SystemLog();
 		loginLog.type = 'login';
 		loginLog.logs = "{'userName':"+req.session.adminUserInfo.userName+",'ip':"+tragetIp+"}";
 		loginLog.save(function(err){
 			if(err){
 				res.end(err);
 			}
 		});
 	}
 }

 var SystemLog = mongoose.model('SystemLog', SystemLogSchema);
 module.exports = SystemLog;