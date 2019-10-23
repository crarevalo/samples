var Sequelize = require('sequelize');

var attributes = {
  video_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true
  },
  location_id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  }
} 
    
var options = {
  timestamps : false,
  freezeTableName: true
}   
    
module.exports.attributes = attributes;
module.exports.options = options;

