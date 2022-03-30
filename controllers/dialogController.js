const Dialog = require('../models/dialogModel');
const Profile = require('../models/profileModel');

exports.add = (req, res) => {
  this.createDialog(req.body.toId, req.body.fromId, res);

  return res.status(200).ok();
};

exports.view = (req, res) => {
  Dialog.find(
    { $or: [{ fromId: req.params.fromId }, { toId: req.params.fromId }] },
    async (error, docs) => {
      if (error) {
        console.log(error);
        return res.json({ status: false, error });
      }

      let results = [];
      for (let doc of docs) {
        const participantId =
          req.params.fromId === doc.fromId ? doc.toId : doc.fromId;
        const participant = await Profile.findById(participantId)
          .select('_id name avatar')
          .exec();

        const dialog = {
          _id: doc._id,
          toId: doc.toId,
          fromId: doc.fromId,
          latestMessage: doc.latestMessage || undefined,
          participant,
        };
        results = [...results, dialog];
      }
      res.json(results);
    }
  ).limit(50);
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
};
