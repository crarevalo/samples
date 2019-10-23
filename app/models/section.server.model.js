var Sequelize = require('sequelize');

var attributes = {
  section_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  file_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  order_index: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

