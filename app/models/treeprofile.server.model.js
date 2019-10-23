var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  first: {
    type: Sequelize.STRING,
    allowNull: true
  },
  middle: {
    type: Sequelize.STRING,
    allowNull: true
  },
  last: {
    type: Sequelize.STRING,
    allowNull: true
  },
  suffix: {
    type: Sequelize.STRING,
    allowNull: true
  },
  living: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

