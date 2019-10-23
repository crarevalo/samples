var Sequelize = require('sequelize');

var attributes = {
  partnership_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  },
  profile_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
  },
  rank: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  }
}
  
var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;

