"use strict";

module.exports = function(sequelize, DataTypes) {
  var Account = sequelize.define("Account", {
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    interest: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        Account.hasMany(models.Transaction),
        Account.hasMany(models.Category),
        Account.belongsTo(models.User)
      }
    }
  });

  return Account;
};