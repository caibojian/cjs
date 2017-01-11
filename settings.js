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
    adsList : ['sysTemManage_ads','广告管理'],
    filesList : ['sysTemManage_files','文件管理'],
    DATAMANAGE : ['sysTemManage_data','数据管理'], // 数据管理
    backUpData : ['sysTemManage_data_1','数据备份'], // 数据备份
    systemLogs : ['sysTemManage_logs','操作日志'], // 系统操作日志


    CONTENTMANAGE : ['contentManage','内容管理'], // 后台模块(内容管理)
    contentList : ['contentManage_content','文档管理'],
    contentCategorys : ['contentManage_cateGory','文档类别管理'],
    contentTags : ['contentManage_tag','文档标签管理'], //标签管理
    CONTENTTEMPSMANAGE : ['contentManage_temp','文档模板管理'], //模板管理
    contentTemps : ['contentManage_temp_1','模板配置'], //模板管理
    contentTempsEdit : ['contentManage_temp_2','模板编辑'], //模板管理
    CONTENTTEMPITEMS : ['contentManage_tpItem','文档模板单元管理'], //模板单元管理
    messageList : ['contentManage_msg','留言管理'], // 留言管理
    NOTICEMANAGE : ['contentManage_notice','消息管理'], // 消息管理
    systemNotice : ['contentManage_notice_1','公告管理'], // 公告管理
    userNotice : ['contentManage_notice_2','用户消息'], // 用户消息
    sysTemBackStageNotice : ['contentManage_notice_3','系统消息'], // 系统消息


    USERMANAGE : ['userManage','会员管理'], // 后台模块(会员管理)
    regUsersList: ['userManage_user','注册用户管理'],
    system_noPower : '用户没有权限',
    log4js_conf:{
          "appenders": [
            {
              "type": "file",
              "filename": "log/log_file.log",
              "maxLogSize": 20480,
              "backups": 3,
            },
            { type: "console" }
          ],
          replaceConsole: true
        }
 };