const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  avatar: { type: String, required: true },
  birthdayDate: { type: Date, required: true },
  email: { type: String, required: true },
  genderId: { type: String, required: true },
  name: { type: String, required: true },
  thumbnail: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Profile = (module.exports = mongoose.model('profile', profileSchema));

module.exports.get = (callback, limit) => {
  Profile.find(callback).limit(limit);
};
