"use strict";

var bcrypt = require('bcrypt');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Account);
        User.hasOne(models.UserMeta);
      },
      hash: function(password, callback) {
        bcrypt.genSalt(11, function (err, salt) {
          if (err){
            callback(err, null);
          } else {
            bcrypt.hash(password, salt, function(err, hash) {
              if (err){
                callback(err, null);
              } else {
                callback(null, hash.toString('hex'));
              }
            });
          }
        });    
      },
      checkPassword: function(password, hash, callback) {
        bcrypt.compare(password, hash, function (err, matched) {
          callback(err, matched);
        });
      }
    }
  });

  return User;
};