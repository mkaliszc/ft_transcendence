import { Sequelize, Model, DataTypes } from 'sequelize'
import { config } from 'dotenv'

require('dotenv').config({ path: '../../.env' })

export const sequelize = new Sequelize(process.env.MARIADB_DATABASE as string, process.env.MARIADB_USER as string, process.env.MARIADB_ROOT_PASSWORD as string, {
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