import { sequelize, DataTypes, Model } from '../../def'

class User extends Model {
  user_id!: number
  username!: string
  email_adress!: string
  hashed_password!: string
  number_of_matches!: number
  number_of_win!: number
  number_of_lose!: number
  creation_date!: Date
  last_update!: Date
  avatar?: string
  twoFA?: boolean
  twoFA_secret?: string
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
  hashed_password: {
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
  avatar: {
    type: DataTypes.TEXT('medium'),
    allowNull: true,
  },
  twoFA: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: false
})

export { User }