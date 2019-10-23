var Sequelize = require('sequelize');

var attributes = {
  recipe_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true
  },
  amount: {
    type: Sequelize.DECIMAL(8, 2),
    allowNull: false
  },
  unit: {
    type: Sequelize.STRING,
    allowNull: false
  },
  display_index: {
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
