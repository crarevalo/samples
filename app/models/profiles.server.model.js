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
  first_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  middle_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  suffix: {
    type: Sequelize.STRING,
    allowNull: true
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

