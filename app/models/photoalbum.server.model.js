var Sequelize = require('sequelize');

var attributes = {
  album_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  photo_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  order_index: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
