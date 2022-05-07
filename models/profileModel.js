const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  yandexId: { type: String, required: true },
  avatar: { type: String, required: false },
  birthdayDate: { type: Date, required: false },
  email: { type: String, required: false },
  genderId: { type: String, required: false },
  name: { type: String, required: false },
  thumbnail: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
});

const Profile = (module.exports = mongoose.model('profile', profileSchema));

module.exports.get = (callback, limit) => {
  Profile.find(callback).limit(limit);
};
