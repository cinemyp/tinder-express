const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  dialogId: { type: String, required: true },
  text: { type: String, required: true },
  fromId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = (module.exports = mongoose.model('message', messageSchema));

module.exports.get = (callback, limit) => {
  Message.find(callback).limit(limit);
};
