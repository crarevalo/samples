var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: Sequelize.STRING,
    allowNull: false
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: true
  },
  user_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  project_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  section_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  warning: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  schedule: {
    type: Sequelize.STRING,
    allowNull: false
  },
  snoozed: {
    type: Sequelize.DATE,
    allowNull: true
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

