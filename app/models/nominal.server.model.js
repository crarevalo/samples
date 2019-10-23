var Sequelize = require('sequelize');

var attributes = {
  project_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  start_date: {
    type: Sequelize.DATE,
    primaryKey: true,
    allowNull: false
  },
  end_date: {
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

