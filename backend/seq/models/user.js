'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        allowNull: false,
        type: DataTypes.STRING(30)
      },
      password: {
        allowNull: true,
        type: DataTypes.CHAR(60)
      },
      bio: {
        allowNull: true,
        type: DataTypes.STRING(500)
      },
      img: {
        allowNull: true,
        type: DataTypes.CHAR(16)
      },
      social_id: {
        allowNull: true,
        type: DataTypes.STRING(25)
      }
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  );

  User.associate = function(models) {
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      targetKey: 'id',
      as: 'receiver'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'peer_user',
      targetKey: 'username',
      as: 'sender'
    });
    User.hasMany(models.Relation, {
      foreignKey: 'user_id',
      as: 'follows'
    });
    User.hasMany(models.Relation, {
      foreignKey: 'follows',
      as: 'followed'
    });
    User.hasMany(models.Post, {
      foreignKey: 'username'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'username',
      as: 'comment_owner'
    });
    User.belongsToMany(models.Comment, {
      through: models.CommentLikes,
      foreignKey: 'user_id',
      as: 'comment_liker'
    });
    User.belongsToMany(models.Post, {
      through: models.PostLikes,
      foreignKey: 'user_id'
    });
  };

  return User;
};
