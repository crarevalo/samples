var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  order_index: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  type_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

