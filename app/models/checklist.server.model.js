var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  start: {
    type: Sequelize.DATE,
    allowNull: true
  },
  end: {
    type: Sequelize.DATE,
    allowNull: true
  },
  ages: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  resets: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  sort_string: {
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

