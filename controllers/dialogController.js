const Dialog = require('../models/dialogModel');
const Profile = require('../models/profileModel');

exports.view = async (fromId) => {
  try {
    const res = await Dialog.find({
      $or: [{ fromId: fromId }, { toId: fromId }],
    })
      .limit(50)
      .exec();

    let results = [];
    for (let doc of res) {
      const participantId = fromId === doc.fromId ? doc.toId : doc.fromId;
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
    return results;
  } catch (err) {
    console.error(error);
  }
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

exports.viewReq = async (req, res) => {
  const fromId = req.params.fromId;

  try {
    const res = await Dialog.find({
      $or: [{ fromId: fromId }, { toId: fromId }],
    })
      .limit(50)
      .exec();

    let results = [];
    for (let doc of res) {
      const participantId = fromId === doc.fromId ? doc.toId : doc.fromId;
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
  } catch (err) {
    console.error(error);
    res.json(err);
  }
};
