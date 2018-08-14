const agentFixtures = require('./agent');

const metric = {
  id: 1,
  agentId: 1,
  type: 'memory',
  value: '300',
  createAt: new Date(),
  updateAt: new Date()
};

const metrics = [
  metric,
  extend(metric, { id: 2, agentId: 1, type: 'cpu', value: '600' }),
  extend(metric, { id: 3, agentId: 2, type: 'memory', value: '200' }),
  extend(metric, { id: 4, agentId: 2, type: 'cpu', value: '1000' }),
  extend(metric, { id: 5, agentId: 2, type: 'gpu', value: '800' }),
  extend(metric, { id: 6, agentId: 1, type: 'memory', value: '900', createAt: new Date('2018-09-14T17:51:53.242Z') }),
  extend(metric, { id: 7, agentId: 2, type: 'gpu', value: '400' }),
  extend(metric, { id: 8, agentId: 1, type: 'disk', value: '700' }),
  extend(metric, { id: 9, agentId: 3, type: 'disk', value: '600' }),
];

function extend(obj, values) {
  return { ...obj, ...values };
}

function getAgentId(uuid) {
  let agent = agentFixtures.byUuid(uuid);

  return agent === undefined ? false : agent.id;
}

function byAgentUuid(uuid) {
  let id = getAgentId(uuid);

  if (id) {
    let s = new Set(metrics.filter(m => m.agentId === id).map(m => m.type));

    return [...s];
  }

  return [];
}

function byTypeAgentUuid(type, uuid) {
  let id = getAgentId(uuid);

  if (id) {
    return metrics.filter(m => m.agentId === id).filter(m => m.type === type).map(m => ({
      id: m.id,
      type: m.type,
      value: m.value,
      createAt: m.createAt
    })).sort((a, b) => b.createAt - a.createAt).slice(0, 20);
  }

  return [];
}

module.exports = {
  single: metric,
  all: metrics,
  byAgentUuid,
  byTypeAgentUuid
};
