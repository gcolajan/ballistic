"use strict";

module.exports = function(sequelize, DataTypes) {
  var Asset = sequelize.define("Asset", {
    name: DataTypes.STRING,
    value: DataTypes.DECIMAL(20, 2)
  }, {
    classMethods: {
      associate: function(models) {
        Asset.belongsTo(models.User)
      }
    }
  });

  return Asset;
};