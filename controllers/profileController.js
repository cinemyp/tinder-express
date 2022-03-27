const Profile = require('../models/profileModel');

exports.index = (req, res) => {
  Profile.get((err, profile) => {
    if (err) {
      res.json({
        status: false,
        message: err,
      });
    }
    res.json({
      status: true,
      data: profile,
    });
  });
};

exports.add = (req, res) => {
  console.log(req.body);
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
