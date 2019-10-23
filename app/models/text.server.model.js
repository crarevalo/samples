var Sequelize = require('sequelize');

var attributes = {
  moment: {
    type: Sequelize.DATE,
    allowNull: false,
    primaryKey: true
  },
  number: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  direction: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  hash: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  comment: {
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
