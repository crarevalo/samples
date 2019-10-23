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
  genre: {
    type: Sequelize.STRING,
    allowNull: true
  },
  year: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  art_url: {
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
