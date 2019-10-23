var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false
  },
  preview_path: {
    type: Sequelize.STRING,
    allowNull: true
  },
  display_path: {
    type: Sequelize.STRING,
    allowNull: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  moment: {
    type: Sequelize.DATE,
    allowNull: false
  },
  width: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  height: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  size: {
    type: Sequelize.BIGINT.UNSIGNED,
    allowNull: false
  },
  orientation: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  latitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: true
  },
  longitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
