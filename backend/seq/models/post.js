'use strict';

module.exports = (sequelize, DataTypes) => {
  
  const Post = sequelize.define('Post', {
    text: { 
      allowNull: false, 
      type: DataTypes.STRING(1000),
      unique: true 
    },
    img: { 
      allowNull: true, 
      type: DataTypes.CHAR(16)
    },
    drink_name: { 
      allowNull: true, 
      type: DataTypes.STRING(100) 
    },
    drink_type: { 
      allowNull: true, 
      type: DataTypes.STRING(100) 
    },
    rating: { 
      allowNull: true,
      defaultValue: 0, 
      type: DataTypes.INTEGER 
    },
    value: {
      allowNull: true,
      defaultValue: 0,
      type: DataTypes.INTEGER
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });

  Post.associate = function(models) {
    Post.hasMany(models.Comment, {
      foreignKey: 'post_id'
    });
    Post.hasMany(models.Notification, {
      foreignKey: 'post_id'
    });
    Post.belongsTo(models.User, {
      foreignKey: 'username', targetKey: 'username'
    });
    Post.belongsToMany(models.User, {
      through: models.PostLikes,
      foreignKey: 'post_id'
    });
  };

  return Post;
};