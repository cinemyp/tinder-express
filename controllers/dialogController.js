const Dialog = require('../models/dialogModel');
const Profile = require('../models/profileModel');

exports.add = (req, res) => {
  this.createDialog(req.body.toId, req.body.fromId, res);

  return res.status(200).ok();
};

exports.view = (req, res) => {
  Dialog.find({ fromId: req.params.fromId }, async (error, docs) => {
    if (error) {
      console.log(error);
      return res.json({ status: false, error });
    }

    let results = [];
    for (let doc of docs) {
      const participant = await Profile.findById(doc.toId).exec();
      const dialog = {
        _id: doc._id,
        toId: doc.toId,
        fromId: doc.fromId,
        participant,
      };
      results = [...results, dialog];
    }
    res.json(results);
  }).limit(50);
};

exports.createDialog = (toId, fromId, res) => {
  const dialog = new Dialog({
    toId: toId,
    fromId: fromId,
  });

  dialog.save((err) => {
    if (err) {
      return res.json(err);
    }
  });

  const otherDialog = new Dialog({
    toId: fromId,
    fromId: toId,
  });

  otherDialog.save((err) => {
    if (err) {
      return res.json(err);
    }
  });
};
