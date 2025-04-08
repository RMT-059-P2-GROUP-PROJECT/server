'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.GroupUser, { foreignKey: 'UserId'});
      User.hasMany(models.Message, { foreignKey: 'SenderId'});
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Username required'
        },
        notNull: {
          args: true,
          msg: 'Username required'
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email must be unique'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Email invalid format'
        },
        notEmpty: {
          args: true,
          msg: 'Email required'
        },
        notNull: {
          args: true,
          msg: 'Email required'
        },
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Password required'
        },
        notNull: {
          args: true,
          msg: 'Password required'
        },
        len: {
          args: [6],
          msg: 'Password minimum 6 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};