var Sequelize = require('sequelize');

var attributes = {
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  moment: {
    type: Sequelize.DATE,
    allowNull: false,
    primaryKey: true
  },
  accuracy: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  latitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: false
  },
  longitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: false
  },
  altitude: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  speed: {
    type: Sequelize.DECIMAL(8, 5),
    allowNull: true
  },
  bearing: {
    type: Sequelize.DECIMAL(4, 1),
    allowNull: true
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
