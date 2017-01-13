/**
 *Created by cbj on 2017/1/4.
 *系统配置项
 **/

 module.exports = {
 	//mongodb数据库配置
 	URL: 'mongodb://172.16.11.9:27017/cjs',
 	DB: 'cjs',
 	HOST: '',
 	PORT: 27017,
 	USERNAME: '',
 	PASSWOED: '',

 	SYSTEMMANAGE : ['sysTemManage','cjs后台管理'],  // 后台模块(系统管理)
    adminUsersList : ['sysTemManage_user','系统用户管理'],
    adminGroupList : ['sysTemManage_uGroup','系统用户组管理'],
    adminLoging : ['sysTemManage_loging','实时日志'],
    adminNetdata : ['sysTemManage_netdata','系统状态'],
   
    system_noPower : '用户没有权限',
    system_Power : "[\"sysTemManage:true\", \"sysTemManage_user:true\", \"sysTemManage_user_add:true\", "+
    "\"sysTemManage_user_view:true\", \"sysTemManage_user_modify:true\", \"sysTemManage_user_del:true\", "+
    "\"sysTemManage_uGroup:true\", \"sysTemManage_uGroup_add:true\", \"sysTemManage_uGroup_view:true\", "+
    "\"sysTemManage_uGroup_modify:true\", \"sysTemManage_uGroup_del:true\"]"
 };