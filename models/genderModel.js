const mongoose = require('mongoose');

const genderSchema = mongoose.Schema({
  name: { type: String, required: true },
});

const Gender = (module.exports = mongoose.model('gender', genderSchema));

module.exports.get = (callback, limit) => {
  Gender.find(callback).limit(limit);
};
