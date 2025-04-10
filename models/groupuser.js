'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GroupUser.belongsTo(models.User, { foreignKey: 'UserId'});
      GroupUser.belongsTo(models.Group, { foreignKey: 'GroupId'});
    }
  }
  GroupUser.init({
    UserId: DataTypes.INTEGER,
    GroupId: DataTypes.INTEGER,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'GroupUser',
  });
  return GroupUser;
};