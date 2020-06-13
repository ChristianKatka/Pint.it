'use strict';

module.exports = (sequelize, DataTypes) => {

  const PostLikes = sequelize.define('PostLikes', {}, {
    timestamps: false
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  PostLikes.associate = function(models) {
    PostLikes.belongsTo(models.Post, {
      foreignKey: 'post_id'
    });
    PostLikes.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
  };

  return PostLikes;
};