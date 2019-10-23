var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  profile_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
  },
  partner_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
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

