/**
 *后台管理元用户
 **/
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
//id生成器
var shortid = require('shortid');
var AdminGroup = require('./AdminGroup');

var AdminUserSchema = new Schema({
	_id: {
		type: String,
		unique: true,
		'default': shortid.generate
	},
	name: String,
	userName: String,
	password: String,
	email: String,
	phoneNum: Number,
	comments: String,
	createtime: {type: Date, default: Date.now},
	photo: {type: String, default: ""},
	auth: {type: Boolean, default: false},
	group: {
        type : String,
        ref : 'AdminGroup'
    }
});



AdminUserSchema.statics = {
	getOneItem: function(res, targetId, callBack){
		AdminUser.findOne({'_id': targetId}).populate('group').exec(function(err, user){
			if(err){
				res.end(err);
			}
			callBack(user);
		})
	}
};

var AdminUser = mongoose.model("AdminUser", AdminUserSchema);

module.exports = AdminUser;