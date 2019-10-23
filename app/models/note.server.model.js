var Sequelize = require('sequelize');

var attributes = {
  moment: {
    type: Sequelize.DATE,
    allowNull: false,
    primaryKey: true
  },
  content: {
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
