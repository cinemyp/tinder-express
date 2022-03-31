const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const Profile = require('../models/profileModel');

// SET STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); //Appending extension
  },
});

const upload = multer({
  storage: storage,
});

const sharp = require('sharp');

const resizeImages = async (req, res, next) => {
  if (!req.file) return next();

  await sharp(req.file.path)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile('/public/uploads/' + Date.now() + '.jpeg');

  next();
};

const removeOriginalFile = (req, res, next) => {
  const { userId } = req.params;
  Profile.findById(userId, (err, profile) => {
    fs.unlink(`public${profile.avatar}`, function () {
      next();
    });
  });
};

router.post(
  '/upload/:userId',
  removeOriginalFile,
  upload.single('file'),
  async (req, res) => {
    let filedata = req.file;
    const userId = req.params.userId;
    await Profile.findByIdAndUpdate(userId, {
      avatar: '/uploads/' + req.file.originalname,
    }).exec();
    if (!filedata) res.send('Ошибка при загрузке файла');
    else res.send('Файл загружен');
  }
);

module.exports = router;
