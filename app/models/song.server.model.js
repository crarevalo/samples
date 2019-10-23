var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  display_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  sort_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  artist_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  album_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  track_number: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  path: {
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
