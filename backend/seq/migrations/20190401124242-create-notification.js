'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      comment_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      post_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      type: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      peer_user: {
        allowNull: false,
        type: Sequelize.STRING(30),
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'sender',
        references: {
          model: 'Users',
          key: 'username'
        }
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        as: 'receiver',
        references: {
          model: 'Users',
          key: 'id'
        }
      },
     post_id: {
       allowNull: true,
       type: Sequelize.INTEGER,
       onDelete: 'CASCADE',
       onUpdate: 'CASCADE',
       references: {
         model: 'Posts',
         key: 'id'
       }
     },
     comment_id: {
       allowNull: true,
       type: Sequelize.INTEGER,
       onDelete: 'CASCADE',
       onUpdate: 'CASCADE',
       references: {
         model: 'Comments',
         key: 'id'
       }
     },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Notifications');
  }
};
