const Message = require('../models/messageModel');
const Profile = require('../models/profileModel');
const Dialog = require('../models/dialogModel');

exports.add = async (dialogId, fromId, text) => {
  const msg = {
    dialogId,
    text,
    fromId,
  };
  try {
    const message = new Message(msg);

    await message.save();

    Dialog.findByIdAndUpdate(dialogId, {
      latestMessage: { text: msg.text, createdAt: Date.now() },
    }).exec();
  } catch (err) {
    console.error(err);
  }
};

exports.view = async (dialogId) => {
  try {
    const data = await Message.find({ dialogId: dialogId }).limit(50).exec();

    //TODO: подумать над оптимизацией, тк всего два пользователя
    let results = [];
    for (let msg of data) {
      const participant = await Profile.findById(msg.fromId)
        .select('_id name avatar')
        .exec();

      const newMsg = {
        _id: msg._id,
        text: msg.text,
        fromId: msg.fromId,
        createdAt: msg.createdAt,
        user: participant,
      };
      results = [newMsg, ...results];
    }
    return results;
  } catch (err) {
    console.error(err);
  }
};
