const Profile = require('../models/profileModel');
const Like = require('../models/likeModel');

exports.index = async (req, res) => {
  const { userId } = req.query;
  const user = await Profile.findById(userId);

  //TODO: добавить проверку, если лайкали
  Profile.find({ genderId: { $ne: user.genderId } }, async (err, profiles) => {
    if (err) {
      res.json({
        status: false,
        message: err,
      });
    }
    let results = [];
    for (let p of profiles) {
      const result = await Like.findOne({ userId, likedUserId: p._id }).exec();
      const hasLiked = !!result;
      if (!hasLiked) {
        results = [...results, p];
      }
    }
    res.json(results);
  });
};

exports.add = (req, res) => {
  const profile = new Profile({
    yandexId: req.body.yandexId,
    name: req.body.name,
    avatar: req.body.avatar ?? '',
    birthdayDate: req.body.birthdayDate,
    email: req.body.email,
    genderId: req.body.genderId,
    thumbnail: req.body.thumbnail ?? '',
  });

  profile.save((err) => {
    if (err) {
      res.json(err);
      console.log(err);
    }
    res.json({ status: true, data: profile });
  });
};

exports.view = (req, res) => {
  Profile.findById(req.params.profileId, (err, profile) => {
    if (err) {
      res.send(err);
    }
    res.json({ status: true, data: profile });
  });
};

exports.update = (req, res) => {
  Profile.findById(req.params.profileId, (err, profile) => {
    if (err) {
      res.send(err);
    }

    profile.name = req.body.name ?? profile.name;
    profile.avatar = req.body.avatar ?? profile.avatar;
    profile.birthdayDate = req.body.birthdayDate;
    profile.email = req.body.email;
    profile.genderId = req.body.genderId;
    profile.thumbnail = req.body.thumbnail ?? profile.thumbnail;

    profile.save((err) => {
      if (err) {
        res.send(err);
      }
      res.json({ status: true, data: profile });
    });
  });
};

exports.delete = (req, res) => {
  Profile.deleteOne(
    {
      _id: req.params.profileId,
    },
    (err, contact) => {
      if (err) {
        res.send(err);
      }
      res.json({ status: true });
    }
  );
};
