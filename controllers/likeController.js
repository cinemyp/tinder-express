const Like = require('../models/likeModel');

exports.add = async (req, res) => {
  const newLike = {
    userId: req.body.userId,
    likedUserId: req.body.likedUserId,
  };

  try {
    const result = await Like.findOne(newLike).exec();
    const hasLiked = !!result;

    if (hasLiked) {
      return res.json({ status: true, data: result });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: false, error: error });
  }
  const like = new Like(newLike);

  like.save((err) => {
    if (err) {
      res.json(err);
    }
    res.json({ status: true, data: like });
  });
};
