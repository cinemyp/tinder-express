const Profile = require('../models/profileModel');
const Like = require('../models/likeModel');
const Gender = require('../models/genderModel');

/**
 * Метод подгрузки профилей
 * @param {*} req
 * @param {*} res
 */
exports.index = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res
      .status(400)
      .jsonp({ message: 'User Id has not been declared in query' });
  }

  const user = await Profile.findById(userId);
  if (!user) {
    return res.status(404).jsonp({
      status: false,
      message: 'User has not found',
    });
  }
  //TODO: добавить обработку ошибок
  Profile.find({ genderId: { $ne: user.genderId } }, async (err, profiles) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    }
    let results = [];
    try {
      for (let p of profiles) {
        const result = await Like.findOne({
          userId,
          likedUserId: p._id,
        }).exec();
        const hasLiked = !!result;
        if (!hasLiked) {
          results = [...results, p];
        }
      }
      res.json(results);
    } catch (err) {
      console.log(err);
    }
  });
};

/**
 * Метод создания нового профиля
 * Используется в АПИ
 * @param {*} req
 * @param {*} res
 */
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

/**
 * Метод просмотра профиля
 * @param {*} req
 * @param {*} res
 */
exports.view = (req, res) => {
  Profile.findById(req.params.profileId, (err, profile) => {
    if (err) {
      res.send(err);
    }
    res.json({ status: true, data: profile });
  });
};

/**
 * Метод обновления профиля
 * @param {*} req
 * @param {*} res
 */
exports.update = async (req, res) => {
  try {
    let gender = await Gender.findOne({
      name: req.body.gender.toLowerCase(),
    }).exec();

    Profile.findById(req.params.uid, (err, profile) => {
      if (err) {
        res.send(err);
      }
      profile.name = req.body.name ?? profile.name;
      profile.avatar = req.body.avatar ?? profile.avatar;
      profile.birthdayDate = req.body.birthday ?? profile.birthdayDate;
      profile.email = req.body.email ?? profile.email;
      profile.genderId = gender._id ?? profile.genderId;
      profile.thumbnail = req.body.thumbnail ?? profile.thumbnail;

      profile.save((err) => {
        if (err) {
          res.send(err);
        }
        res.json({ status: true, data: profile });
      });
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Метод удаления профиля
 * @param {*} req
 * @param {*} res
 */
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
