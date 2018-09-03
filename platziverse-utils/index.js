// Handle Erros
const { handleFatalError, handleError } = require('./error');

// Tests
const agentFixtures = require('./fixtures/agent');
const metricFixtures = require('./fixtures/metric');

// DB
const config = require('./db/config');

// General Functions
const { parsePayload } = require('./utils');

module.exports = {
  handleFatalError,
  handleError,
  agentFixtures,
  metricFixtures,
  config,
  parsePayload
};