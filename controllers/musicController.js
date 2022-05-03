const Profile = require('../models/profileModel');
const { YMApi } = require('ym-api');
const { parseToken } = require('../utils');

exports.index = async (req, res) => {
  const api = new YMApi();
  try {
    const token = parseToken(req);
    console.log(token);
    const { yandexId } = req.body;
    console.log(req.body);
    await api.init({ access_token: token, uid: yandexId });
    const result = await api.getLikedTracks();
    const { tracks } = result.library;

    parsedTracks = await Promise.all(
      tracks.map(async (t) => (await api.getTrack(t.id))[0])
    );

    const data = parsedTracks.map((item) => ({
      title: item.title,
      artists: item.artists,
    }));

    res.jsonp(data);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};
