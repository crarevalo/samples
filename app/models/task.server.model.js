var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
   comment: {
    type: Sequelize.STRING,
    allowNull: true
  },
  deadline: {
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

