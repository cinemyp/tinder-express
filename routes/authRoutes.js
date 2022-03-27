const profileRoutes = require('./profileRoutes');

//initialize express router
let router = require('express').Router();
//set default API response
router.get('/', function (req, res) {
  res.json({
    status: 'AUTH Works',
    message: 'Welcome to Tinify Auth',
  });
});

const authController = require('../controllers/authController');
router.route('/redirect').get(authController.redirect);

module.exports = router;
