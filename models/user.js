"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Asset),
        User.hasMany(models.Account),
        User.hasMany(models.Liability),
        User.hasOne(models.UserMeta)
      }
    }
  });

  return User;
};