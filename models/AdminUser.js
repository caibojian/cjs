/**
 *后台管理元用户
 **/
"use strict";

module.exports = function(sequelize, DataTypes) {
  var AdminUser = sequelize.define("AdminUser", {
  	name: DataTypes.STRING,
	userName: DataTypes.STRING,
	password: DataTypes.STRING,
	email: DataTypes.STRING,
	phoneNum: DataTypes.STRING,
	salt: DataTypes.STRING,
	comments: DataTypes.STRING,
	photo: {type: DataTypes.STRING, default: ""},
	auth: {type: DataTypes.BOOLEAN, default: ""},
  }, {
    classMethods: {
      associate: function(models) {
        // Using additional options like CASCADE etc for demonstration
        // Can also simply do Task.belongsTo(models.User);
        AdminUser.belongsTo(models.AdminGroup);
      }
    }
  });

  return AdminUser;
};
