const Like = require('../models/likeModel');
const { createDialog } = require('./dialogController');

/**
 * Метод отправления лайка (симпатии)
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.add = async (req, res) => {
  const newLike = {
    userId: req.body.userId,
    likedUserId: req.body.likedUserId,
  };
  console.log(req.body);
  try {
    const result = await Like.findOne(newLike).exec();
    const hasLiked = !!result;

    //если мы лайкнули, то ничего не делаем
    if (hasLiked) {
      return res.json({ match: false });
    } else {
      const like = new Like(newLike);

      like.save((err) => {
        if (err) {
          console.log(err);
          return res.json({ status: false, error: err });
        }
      });

      //проверим на взаимную симпатию
      const otherLike = {
        userId: req.body.likedUserId,
        likedUserId: req.body.userId,
      };
      const likeFind = await Like.findOne(otherLike).exec();
      const match = !!likeFind;
      console.log(likeFind);
      //Создадим диалог
      if (match) {
        createDialog(req.body.userId, req.body.likedUserId, res);
      }

      res.json({ match });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: false, error: error });
  }
};
