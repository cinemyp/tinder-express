const Dialog = require('../models/dialogModel');

exports.add = (req, res) => {
  const dialog = new Dialog({
    toId: req.body.toId,
    fromId: req.body.fromId,
  });

  dialog.save((err) => {
    if (err) {
      return res.json(err);
    }
    res.json({ status: true, data: dialog });
  });
};

exports.view = (req, res) => {
  Dialog.find({ fromId: req.params.fromId }, (error, docs) => {
    if (error) {
      return res.json({ status: false, error });
    }
    res.json({ status: true, data: docs });
  }).limit(50);
};
