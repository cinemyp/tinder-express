const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  userId: { type: String, required: true },
  likedUserId: { type: String, required: true },
  likedAt: { type: Date, default: Date.now },
});

const Like = (module.exports = mongoose.model('like', likeSchema));

module.exports.get = (callback, limit) => {
  Like.find(callback).limit(limit);
};
