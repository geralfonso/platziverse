// const arg = process.argv[2];

const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('messageLogged', arg => console.log('Listerner called ', arg));

emitter.emit('messageLogged', { id: 1, url: 'https://' });

let filteredMetrics = metrics.filter(m => m.agentId === id).filter(m => m.type === type);

return filteredMetrics.map(m => {
  return {
    id: m.id,
    type: m.type,
    value: m.value,
    createAt: m.createAt
  };
}).sort((a, b) => b.createAt - a.createAt).slice(0, 20);
