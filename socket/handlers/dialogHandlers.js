const dialogController = require('../../controllers/dialogController');

const dialogHandlers = (io, socket) => {
  const { userId } = socket.handshake.query;

  socket.on('dialogs', async () => {
    const dialogs = await dialogController.view(userId);
    socket.emit('user dialogs', dialogs);
  });
};
module.exports = dialogHandlers;
