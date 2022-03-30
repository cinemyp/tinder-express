const Message = require('../models/messageModel');
const Profile = require('../models/profileModel');

exports.add = (req, res) => {
  const dialogId = req.params.dialogId;

  const message = new Message({
    dialogId,
    text: req.body.content,
    fromId: req.body.fromId,
  });
  //TODO: выставить последние сообщения в диалогах
  message.save((err) => {
    if (err) {
      return res.json(err);
    }
    res.status(201).send();
  });
};

exports.view = (req, res) => {
  Message.find({ dialogId: req.params.dialogId }, async (error, docs) => {
    if (error) {
      return res.json({ status: false, error });
    }

    //TODO: подумать над оптимизацией, тк всего два пользователя
    let results = [];
    for (let msg of docs) {
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
  }).limit(50);
};
