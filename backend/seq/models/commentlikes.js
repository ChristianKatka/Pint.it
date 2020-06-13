'use strict';

module.exports = (sequelize, DataTypes) => {

  const CommentLikes = sequelize.define('CommentLikes', {}, {
    timestamps: false
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  CommentLikes.associate = function(models) {
    CommentLikes.belongsTo(models.Comment, {
      foreignKey: 'comment_id', targetKey: 'id'
    });
    CommentLikes.belongsTo(models.User, {
      foreignKey: 'user_id', targetKey: 'id'
    });
  };

  return CommentLikes;
};