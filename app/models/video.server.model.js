var Sequelize = require('sequelize');

var attributes = {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  path: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  width: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  height: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  size: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  start_year: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  start_month: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  start_date: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  end_year: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  end_month: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  },
  end_date: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: true
  }
}

var options = {
  timestamps : false,
  freezeTableName: true
}

module.exports.attributes = attributes;
module.exports.options = options;
