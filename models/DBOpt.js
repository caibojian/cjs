/**
 *Created by cbj on 2017/1/4.
 *mongodb数据库操作
 **/

 var mongoose = require('mongoose');
 var settings = require('../settings');


 var db = mongoose.connect(settings.URL);
 //mongoose.connect('mongodb://'+settings.USERNAME+':'+settings.PASSWORD+'@'+settings.HOST+':'+settings.PORT+'/'+settings.DB+'');

//数据库操作
var DBopt = {

};

module.exports = DBopt;