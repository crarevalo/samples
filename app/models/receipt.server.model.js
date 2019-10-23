var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  vendor: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.DECIMAL(11, 2),
    allowNull: true
  },
  moment: {
    type: Sequelize.DATE,
    allowNull: false
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content_type: {
    type: Sequelize.STRING,
    allowNull: false
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
