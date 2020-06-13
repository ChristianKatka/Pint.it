'use strict';

module.exports = (sequelize, DataTypes) => {

  const Drink = sequelize.define('Drink', {
    name: DataTypes.STRING(100),
    type: DataTypes.STRING(100)
  }, { 
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  Drink.associate = function(models) {};

  return Drink;
};