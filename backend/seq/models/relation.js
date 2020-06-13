'use strict';

module.exports = (sequelize, DataTypes) => {

  const Relation = sequelize.define('Relation', {}, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  Relation.associate = function(models) {
    Relation.belongsTo(models.User, {
      foreignKey: 'user_id', as: 'follows'
    });
    Relation.belongsTo(models.User, {
      foreignKey: 'follows', as: 'followed'
    });
  };

  return Relation;
};