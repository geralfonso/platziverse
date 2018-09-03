const debug = require('debug')('platziverse:api:routes');
const express = require('express');
const asyncify = require('express-asyncify');
const auth = require('express-jwt');
const db = require('platziverse-db');

const { config } = require('platziverse-utils');

const api = asyncify(express.Router());

let services, Agent, Metric;

api.use('*', async (req, res, next) => {
  debug('Connecting to database');
  if (!services) {
    try {
      services = await db(config.db);
    } catch (e) {
      return next(e);
    }
    Agent = services.Agent;
    Metric = services.Metric;
  }
  next();
});

api.get('/agents', auth(config.auth), async (req, res, next) => {
  debug('A request has come to /agents');
  const { user } = req;

  if (!user || !user.username) return next(new Error('Not authorized'));

  let agents = [];

  try {
    if (user.admin) {
      agents = await Agent.findConnected();
    } else {
      agents = await Agent.findByUsername(user.username);
    }
  } catch (e) {
    return next(e);
  }
  res.send(agents);
});
api.get('/agent/:uuid', auth(config.auth), async (req, res, next) => {
  const { uuid } = req.params;
  const { user } = req;

  if (!user || !user.username) return next(new Error('Not authorized'));
  debug(`request to /agent/${uuid}`);

  let agent;

  try {
    agent = await Agent.findByUuid(uuid);
  } catch (e) {
    return next();
  }

  if (!agent) return next(new Error(`Agent not found with ${uuid}`));

  res.send(agent);
});

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params;

  debug(`request to /metrics/${uuid}`);

  metrics = [];
  try {
    metrics = await Metric.findByAgentUuid(uuid);
  } catch (e) {
    return next(e);
  }

  if (!metrics || metrics.length === 0) {
    return next(
      new Error(`Metris not found for the Agent with the uuid: ${uuid}`)
    );
  }
  res.send(metrics);
});

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params;

  metrics = [];
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid);
  } catch (e) {
    return next(e);
  }

  if (!metrics || metrics.length === 0) {
    return next(
      new Error(
        `Metrics with the type: ${type} not found for the Agent with the uuid: ${uuid}`
      )
    );
  }

  res.send(metrics);
});

module.exports = api;