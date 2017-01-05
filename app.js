var express = require('express');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
//模板引擎
var partials = require('express-partials');

var adminServer = require('./routes/adminServer');
var admin = require('./routes/admin');
/*实例化express对象*/
var app = express();
//session配置
app.use(session({
    secret: 'caibojian',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.json({limit: '50mb'})); // 限制上传5M
app.use(bodyParser.urlencoded({ extended: false , limit: '50mb' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());

app.use(function(req, res, next){
//    针对注册会员
    res.locals.logined = req.session.logined;
    res.locals.userInfo = req.session.user;
//    针对管理员
    res.locals.adminlogined = req.session.adminlogined;
    res.locals.adminUserInfo = req.session.adminUserInfo;
    res.locals.adminNotices = req.session.adminNotices;
//    指定站点域名
    res.locals.myDomain = req.headers.host;
    next();
});

/*指定路由控制*/
app.use('/admin', admin);
app.use('/admin', adminServer);


module.exports = app;