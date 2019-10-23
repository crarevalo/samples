var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  type_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  content_start: {
    type: Sequelize.DATE
  },
  content_end: {
    type: Sequelize.DATE
  },
  edit_start: {
    type: Sequelize.DATE
  },
  edit_end:{
    type: Sequelize.DATE
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

var options = {
  timestamps: false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
