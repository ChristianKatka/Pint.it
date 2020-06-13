'use strict';

module.exports = (sequelize, DataTypes) => {

  const Comment = sequelize.define('Comment', {
    text: { allownull: false, type: DataTypes.STRING(500) },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  Comment.associate = function(models) {
    Comment.hasMany(models.Notification, {
      foreignKey: 'comment_id'
    });
    Comment.belongsTo(models.Post, {
      foreignKey: 'post_id',
    });
    Comment.belongsTo(models.User, {
      foreignKey: 'username', 
      targetKey: 'username',
      as: 'comment_owner'
    });
    Comment.belongsToMany(models.User, {
      through: models.CommentLikes,
      targetKey: 'comment_id',
      foreignKey: 'comment_id',
      as: 'comment_liker'
    });
  };

  return Comment;
};