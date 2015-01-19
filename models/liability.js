"use strict";

module.exports = function(sequelize, DataTypes) {
  var Liability = sequelize.define("Liability", {
    name: DataTypes.STRING,
    value: DataTypes.DECIMAL(20, 2)
  }, {
    classMethods: {
      associate: function(models) {
        Liability.belongsTo(models.User)
      }
    }
  });

  return Liability;
};