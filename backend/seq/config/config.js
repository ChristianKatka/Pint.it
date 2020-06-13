const dotenv = require('dotenv').config();

module.exports = {

  // For local development
  development: {
    username: 'root',
    password: 'root',
    database: 'backendPintit',
    host: '127.0.0.1',
    dialect: 'mysql'
  },

  // For Heroku and AWS RDS -database
  production: {
    host: process.env.AWS_DB_HOST,
    username: process.env.AWS_DB_USERNAME,
    password: process.env.AWS_DB_PASSWORD,
    port: process.env.AWS_DB_PORT,
    database: process.env.AWS_DB_NAME,
    pool: {
      idle: 1
    },
    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_general_ci'
      }
    },
    dialect: 'mysql'
  }
};
