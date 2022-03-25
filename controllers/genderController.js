const Gender = require('../models/genderModel');

exports.index = (req, res) => {
  Gender.get((err, profile) => {
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
