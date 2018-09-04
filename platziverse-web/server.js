const http = require('http');
const path = require('path');
const debug = require('debug')('platziverse:web');
const express = require('express');
const socketio = require('socket.io');
const { handleFatalError } = require('platziverse-utils');
const chalk = require('chalk');

const port = process.env.PORT || 8080;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

// Socket.io / WebSockets
io.on('connect', socket => {
  debug(`Connected ${socket.id}`);

  socket.on('agent/message', payload => {
    console.log(payload);
  });

  setInterval(() => {
    socket.emit('agent/message', { agent: 'xxx-yyy' });
  }, 2000);

});

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);

server.listen(port, () => {
  console.log(
    `${chalk.green('[platziverse-web]')} server listening on port ${port}`
  );
});
