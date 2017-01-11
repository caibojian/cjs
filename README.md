#CJS项目简介
### 界面展示：
![](){ImgCap}{/ImgCap}

### 用户管理
![](){ImgCap}{/ImgCap}

### 权限管理
![](){ImgCap}{/ImgCap}

### 实时日志
![](){ImgCap}{/ImgCap}
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
- 日志管理：SLF4J、Log4j2
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