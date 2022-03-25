const profileRoutes = require('./profileRoutes');

//initialize express router
let router = require('express').Router();
//set default API response
router.get('/', function (req, res) {
  res.json({
    status: 'API Works',
    message: 'Welcome to Tinify API',
  });
});

const profileController = require('../controllers/profileController');

router
  .route('/profile')
  .get(profileController.index)
  .post(profileController.add);

router
  .route('/profile/:profileId')
  .get(profileController.view)
  .patch(profileController.update)
  .put(profileController.update)
  .delete(profileController.delete);

const genderController = require('../controllers/genderController');

router.route('/gender').get(genderController.index);

const likeController = require('../controllers/likeController');

router.route('/like').post(likeController.add);

const messageController = require('../controllers/messageController');

router
  .route('/msg/:dialogId')
  .post(messageController.add)
  .get(messageController.view);

//Export API routes
module.exports = router;
