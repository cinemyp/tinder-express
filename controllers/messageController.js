const Message = require('../models/messageModel');
const Profile = require('../models/profileModel');
const Dialog = require('../models/dialogModel');
const { limitText } = require('../utils');

/**
 * Метод сохранения сообщения в БД
 * Используется в сокете
 * @param {*} dialogId
 * @param {*} fromId
 * @param {*} text
 */
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
      latestMessage: { text: limitText(msg.text, 40), createdAt: Date.now() },
    }).exec();
  } catch (err) {
    console.error(err);
  }
};

/**
 * Метод сохранения сообщения в БД
 * Используется в АПИ
 * @param {*} req
 * @param {*} res
 */
exports.addReq = async (req, res) => {
  const { dialogId } = req.params;
  const { fromId, text } = req.body;

  const msg = {
    dialogId,
    text,
    fromId,
  };
  try {
    const message = new Message(msg);

    await message.save();

    Dialog.findByIdAndUpdate(dialogId, {
      latestMessage: { text: limitText(msg.text, 40), createdAt: Date.now() },
    }).exec();
    res.ok();
  } catch (err) {
    console.error(err);
    res.json(err);
  }
};

/**
 * Метод получения сообщений
 * Используется в сокете
 * @param {*} dialogId
 * @returns
 */
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

/**
 * Метод получения сообщений
 * Используется в АПИ
 * @param {*} req
 * @param {*} res
 */
exports.viewReq = async (req, res) => {
  const { dialogId } = req.params;
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
    res.json(results);
  } catch (err) {
    res.json(err);
    console.error(err);
  }
};
