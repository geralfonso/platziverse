const Sequelize = require('sequelize');
const setupDatabase = require('../lib/db');

module.exports = function setupAgentModel(config) {
  const sequelize = setupDatabase(config);

  return sequelize.define('metric', {
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  });
};
