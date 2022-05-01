const messageController = require('../../controllers/messageController');

const messageHandlers = (io, socket) => {
  socket.on('msg:get', async (dialogId) => {
    const msgs = await messageController.view(dialogId);
    socket.in(dialogId).emit('msg:update', msgs);
  });
  socket.on('msg:send', async (dialogId, fromId, text) => {
    await messageController.add(dialogId, fromId, text);

    const msgs = await messageController.view(dialogId);
    socket.in(dialogId).emit('msg:update', msgs);
  });
};
module.exports = messageHandlers;
