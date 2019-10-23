var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  address: {
    type: Sequelize.STRING
  },
  latitude: {
    type: Sequelize.DECIMAL
  },
  longitude:{
    type: Sequelize.DECIMAL
  }
}

var options = {
  timestamps: false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
