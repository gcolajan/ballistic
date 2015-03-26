"use strict";

module.exports = function(sequelize, DataTypes) {
  var UserMeta = sequelize.define("UserMeta", {
    currency: {type: DataTypes.CHAR, defaultValue: '$'},
    goal: DataTypes.DECIMAL(20, 2),
    age: DataTypes.INTEGER,
    depletingPrincipal: DataTypes.BOOLEAN,
    lifeSpan: DataTypes.INTEGER,
    includeInflation: DataTypes.BOOLEAN,
    inflation: DataTypes.FLOAT
  }, {
    classMethods: {
      associate: function(models) {
        UserMeta.belongsTo(models.User);
      }
    }
  });

  return UserMeta;
};