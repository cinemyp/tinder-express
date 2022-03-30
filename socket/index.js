const dialogHandlers = require('./handlers/dialogHandlers');
const messageHandlers = require('./handlers/messageHandlers');

exports.onConnection = (io, socket) => {
  dialogHandlers(io, socket);
  messageHandlers(io, socket);

  socket.emit('connection');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
};
