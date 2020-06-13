'use strict';

module.exports = (sequelize, DataTypes) => {

  const Notification = sequelize.define('Notification', {
    type: { allowNull: false, type: DataTypes.INTEGER }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id', 
      as: 'receiver'
    });
    Notification.belongsTo(models.User, {
      foreignKey: 'peer_user', 
      targetKey: 'username',
      as: 'sender'
    });
    Notification.belongsTo(models.Post, {
      foreignKey: 'post_id',
      targetKey: 'id'
    });
    Notification.belongsTo(models.Comment, {
      foreignKey: 'comment_id',
      targeKey: 'id'
    });
  };

  return Notification;
};