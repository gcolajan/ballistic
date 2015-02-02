"use strict";

module.exports = function(sequelize, DataTypes) {
  var UserMeta = sequelize.define("UserMeta", {
    currency: {type: DataTypes.CHAR, defaultValue: '$'},
    goal: DataTypes.DECIMAL(20, 2),
    age: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        UserMeta.belongsTo(models.User)
      }
    }
  });

  return UserMeta;
};