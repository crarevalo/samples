var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
