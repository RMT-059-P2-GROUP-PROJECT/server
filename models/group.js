'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.hasMany(models.GroupUser, { foreignKey: 'GroupId'});
      Group.belongsToMany(models.User, {through: models.GroupUser, foreignKey: 'GroupId'});
      Group.hasMany(models.Message, {foreignKey: 'GroupId'})
    }
  }
  Group.init({
    name: DataTypes.STRING,
    createdBy: DataTypes.INTEGER,
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }    
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};