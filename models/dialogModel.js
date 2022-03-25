const mongoose = require('mongoose');

const dialogSchema = mongoose.Schema({
  toId: { type: String, required: true },
  fromId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Dialog = (module.exports = mongoose.model('dialog', dialogSchema));

module.exports.get = (callback, limit) => {
  Dialog.find(callback).limit(limit);
};
