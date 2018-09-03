const setupDatabase = require('./lib/db');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const setupAgentModel = require('./models/agent');
const setupMetricModel = require('./models/metric');
const setupAgent = require('./lib/agent');
const setupMetric = require('./lib/metric');
const defaults = require('defaults');

module.exports = async function(config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    },
    freezeTableName: true,
    operatorsAliases: {
      $and: Op.and,
      $or: Op.or,
      $eq: Op.eq,
      $gt: Op.gt,
      $lt: Op.lt,
      $lte: Op.lte,
      $like: Op.like
    }
  });

  const sequelize = setupDatabase(config);
  const AgentModel = setupAgentModel(config);
  const MetricModel = setupMetricModel(config);

  AgentModel.hasMany(MetricModel);
  MetricModel.belongsTo(AgentModel);

  await sequelize.authenticate();

  if (config.setup) {
    await sequelize.sync({ force: true });
  }

  const Agent = setupAgent(AgentModel);
  const Metric = setupMetric(MetricModel,AgentModel);

  return {
    Agent,
    Metric
  };
};
