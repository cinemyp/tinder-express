const dialogHandlers = require('./handlers/dialogHandlers');
const messageHandlers = require('./handlers/messageHandlers');

exports.onConnection = (io, socket) => {
  dialogHandlers(io, socket);
  messageHandlers(io, socket);

  socket.join(socket.handshake.auth.customId.toString());
  socket.emit('connection');
  socket.on('disconnect', () => {
    socket.leave(socket.handshake.auth.customId.toString());
    console.log('user disconnected');
  });
};
