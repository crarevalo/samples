var Sequelize = require('sequelize');

var attributes = {
  code: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  moment: {
    type: Sequelize.DATE,
    allowNull: false,
    primaryKey: true,
    defaultValue: Sequelize.NOW
  },
  task_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

