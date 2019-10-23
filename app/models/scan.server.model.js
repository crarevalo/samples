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
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  year: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  month: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  date: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  location_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  orientation: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  author_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
