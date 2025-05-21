import { Sequelize, Model, DataTypes } from 'sequelize'

// Create and export the Sequelize instance
export const sequelize = new Sequelize('database', 'username', 'password', { // ! database username and password to change according to the .env (dotenv)
  host: 'localhost',
  dialect: 'mariadb',
  logging: false, // Disable logging for cleaner output
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// Re-export Model and DataTypes so they can be imported from this file
export { Model, DataTypes }