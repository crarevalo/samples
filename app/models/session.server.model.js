var Sequelize = require('sequelize');

var attributes = {
  session_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  url: {
    type: Sequelize.STRING,
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
