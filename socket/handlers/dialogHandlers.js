const dialogController = require('../../controllers/dialogController');

const dialogHandlers = (io, socket) => {
  const { userId } = socket.handshake.query;

  socket.on('dialogs:get', async () => {
    const dialogs = await dialogController.view(userId);
    socket.emit('dialogs:send', dialogs);
  });
};
module.exports = dialogHandlers;
