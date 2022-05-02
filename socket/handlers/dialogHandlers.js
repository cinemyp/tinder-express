const dialogController = require('../../controllers/dialogController');

const dialogHandlers = (io, socket) => {
  socket.on('dialogs:get', async (userId) => {
    const dialogs = await dialogController.view(userId);
    socket.emit('dialogs:send', dialogs);
  });

  socket.on('dialogs:join', async (dialogId) => {
    socket.join(dialogId.toString());
  });

  socket.on('dialogs:leave', async (dialogId) => {
    socket.leave(dialogId.toString());
  });
};
module.exports = dialogHandlers;
