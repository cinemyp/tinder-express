const authController = require('../controllers/authController');
const { verifyUser } = require('../middlewares');

//initialize express router
let router = require('express').Router();

router.route('/').get(authController.auth);
router.route('/callback').get(authController.callback);
router.route('/logout').get(authController.loguout);
router.route('/me').get(authController.me);
router.route('/success').get(authController.success);

module.exports = router;
