const Message = require('../models/messageModel');

exports.add = (req, res) => {
  const dialogId = req.params.dialogId;

  const message = new Message({
    dialogId,
    content: req.body.content,
  });

  message.save((err) => {
    if (err) {
      return res.json(err);
    }
    res.json({ status: true, data: message });
  });
};

exports.view = (req, res) => {
  Message.find({ dialogId: req.params.dialogId }, (error, docs) => {
    if (error) {
      return res.json({ status: false, error });
    }
    res.json({ status: true, data: docs });
  }).limit(50);
};
