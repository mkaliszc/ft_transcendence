import { sequelize, DataTypes, Model } from '../../def'

class User extends Model {
  user_id!: number
  username!: string
  email_adress!: string
  hassed_password!: string
  number_of_matches!: number
  number_of_win!: number
  number_of_lose!: number
  creation_date!: Date
  last_update!: Date
  customization_data?: object
  avatar?: string
  twoFA?: boolean
}

User.init({
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  email_adress: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  hassed_password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  number_of_matches: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  number_of_win: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  number_of_lose: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  creation_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  last_update: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  customization_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  avatar: {
    type: DataTypes.TEXT('medium'),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  twoFA: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize, // Pass the connection instance
  tableName: 'users', // Important: match the actual table name
  timestamps: false   // Prevent Sequelize from auto-adding `createdAt` and `updatedAt`
})

export { User }