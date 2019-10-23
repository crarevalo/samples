var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  location: {
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
  created: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: true 
  },
  type_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  status_id: {
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

