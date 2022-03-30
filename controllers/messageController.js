const Message = require('../models/messageModel');

exports.add = (req, res) => {
  const dialogId = req.params.dialogId;

  const message = new Message({
    dialogId,
    content: req.body.content,
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
  Message.find({ dialogId: req.params.dialogId }, (error, docs) => {
    if (error) {
      return res.json({ status: false, error });
    }
    res.json(docs);
  }).limit(50);
};
