const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const { metricFixtures, agentFixtures } = require('platziverse-utils');

let config = {
  logging() {}
};

let MetricStub = null;
let AgentStub = null;
let uuid = 'yyy-yyy-yyy';
let type = 'memory';
let db, sandbox;

let uuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [
    {
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }
  ],
  raw: true
};

let typeArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [
    {
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }
  ],
  raw: true
};

let newMetric = {
  id: 10,
  type: 'memory',
  value: '300'
};

let agentUuidArgs = {
  where: { uuid }
};

test.beforeEach(async () => {
  sandbox = sinon.createSandbox();
  MetricStub = {
    belongsTo: sandbox.spy()
  };
  AgentStub = {
    hasMany: sandbox.spy()
  };

  // Model create Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(agentUuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  MetricStub.create = sandbox.stub();
  MetricStub.create.withArgs(newMetric).returns(
    Promise.resolve({
      toJSON() {
        return newMetric;
      }
    })
  );

  uuidArgs.include[0].model = AgentStub;
  typeArgs.include[0].model = AgentStub;

  // Model findAll Stub
  MetricStub.findAll = sandbox.stub();
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all));
  MetricStub.findAll
    .withArgs(uuidArgs)
    .returns(Promise.resolve(metricFixtures.byAgentUuid(uuid)));
  MetricStub.findAll
    .withArgs(typeArgs)
    .returns(Promise.resolve(metricFixtures.byTypeAgentUuid(type, uuid)));

  const setupDatabase = proxyquire('../', {
    './models/metric': () => MetricStub,
    './models/agent': () => AgentStub
  });

  db = await setupDatabase(config);
});

test.afterEach(() => {
  sandbox && sandbox.restore();
});

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist');
});

test.serial('Setup Metric', t => {
  t.true(
    MetricStub.belongsTo.called,
    'MetricModel.belongsTo should be executed'
  );
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Arguments should be the AgentModel'
  );
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany should be executed');
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Arguments should be the MetricModel'
  );
});

test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid);

  t.true(MetricStub.findAll.called, 'findAll should be called on model');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.true(
    MetricStub.findAll.calledWith(uuidArgs),
    'findAll should be called without args'
  );
  t.deepEqual(metric, metricFixtures.byAgentUuid(uuid), 'Should be the same');
});

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metric = await db.Metric.findByTypeAgentUuid(type, uuid);

  t.true(MetricStub.findAll.called, 'findAll should be called on model');
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once');
  t.true(
    MetricStub.findAll.calledWith(typeArgs),
    'findAll should be called without args'
  );
  t.deepEqual(
    metric,
    metricFixtures.byTypeAgentUuid(type, uuid),
    'Should be the same'
  );
});

test.serial('Metric#Create', async t => {
  let metric = await db.Metric.create(uuid, newMetric);

  t.true(AgentStub.findOne.called, 'Agent findOne should be called on model');
  t.true(AgentStub.findOne.calledOnce, 'Agent findOne should be called once');
  t.true(
    AgentStub.findOne.calledWith(agentUuidArgs),
    'findOne should be called with uuid args'
  );

  t.true(MetricStub.create.called, 'create should be called on model');
  t.true(MetricStub.create.calledOnce, 'create should be called once');
  t.true(
    MetricStub.create.calledWith(newMetric),
    'create should be called once'
  );

  t.deepEqual(metric, newMetric, 'agent should be the same');
});
