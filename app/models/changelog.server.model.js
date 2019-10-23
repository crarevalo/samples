var Sequelize = require('sequelize');

var attributes = {
  user_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  project_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  file_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  action_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  note: {
    type: Sequelize.STRING,
    allowNull: true
  },
  moment: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    primaryKey: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
