#CJS项目简介
### 界面展示：

![首页](http://git.oschina.net/uploads/images/2017/0111/155130_43e3cca1_130351.png "首页")

### 用户管理

![用户管理](http://git.oschina.net/uploads/images/2017/0111/155140_4abb325f_130351.png "用户管理")

### 权限管理

![用户组管理](http://git.oschina.net/uploads/images/2017/0111/155148_6acbfe4a_130351.png "用户组管理")

### 实时日志

![实时日志](http://git.oschina.net/uploads/images/2017/0111/155225_48bc077a_130351.png "实时日志")

***
# 主要功能
- 用户管理：可增删查改人员信息。
- 用户组管理：进行人员权限的分配功能
- 实时日志：登录系统后，进入该菜单后台就可以实时将后台新增的日志数据推送到前端来，再也不需要用tail -f 之类的命令了

***

# 核心技术

目前应用的核心模块如下：
- 核心框架：node.js + express
- 安全框架：自己写的权限管理功能
- 持久层框架：mongodb
- 缓存框架：Redis（暂未完成）
- 会话管理：express-session
- 日志管理：Log4js
- 前端框架：Angular JS + Bootstrap + Jquery

***

# 启动说明
- npm install
- npm start

***

# 感谢
- [doramart/DoraCMS](https://github.com/doramart/DoraCMS)--本框架是基于该系统进行开发的
- [Amaze UI](http://tpl.amazeui.org/preview.html?21)--前端框架
***
