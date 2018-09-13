// Handle Erros
const { handleFatalError, handleError } = require('./error');

// Tests
const agentFixtures = require('./fixtures/agent');
const metricFixtures = require('./fixtures/metric');

// DB
const config = require('./db/config');

// General Functions
const { parsePayload } = require('./utils');

// Authentication
const auth = require('./auth');

// Pipe Sockets
const { pipe } = require('./pipe');

module.exports = {
  handleFatalError,
  handleError,
  agentFixtures,
  metricFixtures,
  config,
  parsePayload,
  auth,
  pipe
};
