const test = require('ava');
const util = require('util');
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { agentFixtures, metricFixtures, config, auth } = require('platziverse-utils');

const sign = util.promisify(auth.sign);

let sandbox = null,
  server = null,
  dbStub = null,
  token = null,
  notAuthToken = null,
  uuid = 'yyy-yyy-yyy',
  uuidNotFound = 'yyy-yyy-yyp',
  type = 'cpu',
  typeNotFound = 'temp',
  AgentStub = {},
  MetricStub = {};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();

  dbStub = sandbox.stub();
  dbStub.returns(
    Promise.resolve({
      Agent: AgentStub,
      Metric: MetricStub
    })
  );

  // Agent Model FindConnected
  AgentStub.findConnected = sandbox.stub();
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected));

  token = await sign({ permissions: ['metrics:read'], admin: true, username: 'platzi' }, config.auth.secret);
  notAuthToken = await sign({ permissions: ['metrics:read'] }, config.auth.secret);

  // Agent Model ByUuid
  AgentStub.findByUuid = sandbox.stub();
  AgentStub.findByUuid
    .withArgs(uuid)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  // Metric Model findByAgentUuid
  MetricStub.findByAgentUuid = sandbox.stub();
  MetricStub.findByAgentUuid
    .withArgs(uuid)
    .returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)));

  // Metric Model findByTypeAgentUuid
  MetricStub.findByTypeAgentUuid = sandbox.stub();
  MetricStub.findByTypeAgentUuid
    .withArgs(type, uuid)
    .returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, uuid)));

  const api = proxyquire('../api', {
    'platziverse-db': dbStub
  });

  server = proxyquire('../server', {
    './api': api
  });
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      let body = JSON.stringify(res.body),
        expected = JSON.stringify(agentFixtures.connected);

      t.deepEqual(body, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agents - Not authorized', t => {
  request(server)
    .get('/api/agents')
    .set('Authorization', `Bearer ${notAuthToken}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body;

      t.regex(
        body.error,
        /Not authorized/,
        'Error should have the Not authorized phrase'
      );
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      let body = JSON.stringify(res.body),
        expected = JSON.stringify(agentFixtures.byUuid(uuid));

      t.deepEqual(body, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${uuidNotFound}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body,
        expected = agentFixtures.byUuid(uuidNotFound);

      t.regex(
        body.error,
        /not found/,
        'Error should have the not found phrase'
      );
      t.deepEqual(body.error, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/agent/:uuid - Not authorized', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .set('Authorization', `Bearer ${notAuthToken}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body;

      t.regex(
        body.error,
        /Not authorized/,
        'Error should have the Not authorized phrase'
      );
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      let body = JSON.stringify(res.body),
        expected = JSON.stringify(metricFixtures.byAgentUuid(uuid));

      t.deepEqual(body, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body,
        expected = metricFixtures.byAgentUuid(uuidNotFound);

      t.regex(
        body.error,
        /not found/,
        'Error should have the not found phrase'
      );
      t.deepEqual(body.error, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid - Not authorized', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .set('Authorization', `Bearer ${notAuthToken}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body;

      t.regex(
        body.error,
        /Not authorized/,
        'Error should have the Not authorized phrase'
      );
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error');
      let body = JSON.stringify(res.body),
        expected = JSON.stringify(metricFixtures.byTypeAgentUuid(type, uuid));

      t.deepEqual(body, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}/${typeNotFound}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body,
        expected = metricFixtures.byTypeAgentUuid(typeNotFound, uuidNotFound);

      t.regex(
        body.error,
        /not found/,
        'Error should have the not found phrase'
      );
      t.deepEqual(body.error, expected, 'response body should be the expected');
      t.end();
    });
});

test.serial.cb('/api/metrics/:uuid/:type - Not authorized', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .set('Authorization', `Bearer ${notAuthToken}`)
    .expect(500)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an unknowing error');
      let body = res.body;

      t.regex(
        body.error,
        /Not authorized/,
        'Error should have the Not authorized phrase'
      );
      t.end();
    });
});