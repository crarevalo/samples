var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  moment:{
    type: Sequelize.DATE,
    allowNull: false
  },
  sender: {
    type: Sequelize.STRING,
    allowNull: false
  },
  subject: {
    type: Sequelize.STRING
  },
  path: {
    type: Sequelize.STRING
  }
}

var options = {
  timestamps: false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
