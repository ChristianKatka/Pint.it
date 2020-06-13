'use strict';

module.exports = {

  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      text: { 
        allowNull: false, 
        type: Sequelize.STRING(1000) 
      },
      img: { 
        allowNull: true, 
        type: Sequelize.CHAR(16) 
      },
      drink_name: { 
        allowNull: true, 
        type: Sequelize.STRING(100) 
      },
      drink_type: { 
        allowNull: true, 
        type: Sequelize.STRING(100) 
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(30),
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        references: {
          model: 'Users', key: 'username'
        }
      },
      rating: { 
        allowNull: true, 
        type: Sequelize.INTEGER 
      },
      value: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Posts');
  }
};