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

exports.getTopArtists = async (req, res) => {
  const api = new YMApi();
  try {
    const token = parseToken(req);
    console.log(token);
    const { uid } = req.params;
    await api.init({ access_token: token, uid: uid });
    const result = await api.getLikedTracks();
    const { tracks } = result.library;

    parsedTracks = await Promise.all(
      tracks.map(async (t) => (await api.getTrack(t.id))[0])
    );

    const artists = parsedTracks.map((item) => ({
      id: item.artists[0].id,
      name: item.artists[0].name,
      avatarUri: item.artists[0].cover.uri,
    }));

    const data = countArtists(artists);
    res.jsonp(data);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

function countArtists(arr) {
  const freq = {};
  arr.forEach((item) => {
    freq[item.id] = (freq[item.id] || 0) + 1;
  });
  const sortedFreqkeys = Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .splice(0, 3);

  const result = sortedFreqkeys.map((id) => {
    const artist = arr.find((item) => item.id === +id);
    return {
      id: id,
      name: artist.name,
      uri: 'https://' + artist.avatarUri.replace('%%', '150x150'),
    };
  });

  return result;
}
