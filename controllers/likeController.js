const Like = require('../models/likeModel');

exports.add = async (req, res) => {
  const newLike = {
    userId: req.body.userId,
    likedUserId: req.body.likedUserId,
  };
  console.log(req.body);
  try {
    const result = await Like.findOne(newLike).exec();
    const hasLiked = !!result;
    if (hasLiked) {
      return res.json({ status: true });
    } else {
      const like = new Like(newLike);

      like.save((err) => {
        if (err) {
          console.log(err);
          return res.json({ status: false, error: err });
        }
        res.json({ status: true });
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: false, error: error });
  }
};
