var Sequelize = require('sequelize');

var attributes = {
  email_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  field: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  } 
}

var options = {
  timestamps: false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
