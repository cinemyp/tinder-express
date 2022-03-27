const passport = require('passport');
const authController = require('../controllers/authController');

//initialize express router
let router = require('express').Router();

router.route('/').get(passport.authenticate('yandex'), authController.auth);
router
  .route('/callback')
  .get(
    passport.authenticate('yandex', { failureRedirect: '/login' }),
    authController.callback
  );
router.get('/logout').get(authController.loguout);

module.exports = router;
