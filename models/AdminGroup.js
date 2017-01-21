/**
 * Created by cbj on 2016/1/9.
 * 员用户组对象
 */

"use strict";

module.exports = function(sequelize, DataTypes) {
  var AdminGroup = sequelize.define("AdminGroup", {
    name:  DataTypes.STRING,
    power : DataTypes.TEXT,
    comments : DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // Using additional options like CASCADE etc for demonstration
        // Can also simply do Task.belongsTo(models.User);
        AdminGroup.hasMany(models.AdminUser);
      }
    }
  });

  return AdminGroup;
};
