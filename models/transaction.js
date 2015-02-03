"use strict";

module.exports = function(sequelize, DataTypes) {
  var Transaction = sequelize.define("Transaction", {
    date: DataTypes.DATEONLY,
    type: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(20, 2),
    description: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Transaction.belongsTo(models.Account);
        Transaction.belongsTo(models.Category);
      }
    }
  });

  return Transaction;
};