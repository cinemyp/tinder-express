const Profile = require('../models/profileModel');
const { YMApi } = require('ym-api');
const { parseToken, mergeArrays, removeDuplicates } = require('../utils');

exports.index = async (req, res) => {
  const api = new YMApi();
  try {
    const token = parseToken(req);
    console.log(token);
    const { yandexId } = req.body;
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
    //Инициализируем АПИ Яндекса
    const { uid } = req.params;
    await api.init({ uid, access_token: token });

    const { artists: artistsIds, tracks } = await getTracksAndArtists(
      uid,
      token
    );

    //считаем количество вхождений и получаем популярных
    const data = countArtists(artistsIds);

    const artists = await api.getArtists(data);
    const result = artists.map((item) => ({
      id: item.id,
      name: item.name,
      ratings: item.ratings,
      uri: 'https://' + item.cover?.uri.replace('%%', '150x150'),
    }));

    res.jsonp(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

exports.compareTastes = async (req, res) => {
  const { uids } = req.params;
  const token = parseToken(req);

  const [uidFrom, uidTo] = uids.split(':');

  const [userDataFrom, userDataTo] = await Promise.all([
    getTracksAndArtists(uidFrom, token),
    getTracksAndArtists(uidTo, token),
  ]);

  const { artists: artistsFromAll } = userDataFrom;
  const { artists: artistsToAll } = userDataTo;
  //количество совпадений
  const artistMatches = [];
  const len = Math.min(artistsFromAll.length, artistsToAll.length);

  const artistsFrom = artistsFromAll.slice(0, len);
  const artistsTo = artistsToAll.slice(0, len);

  artistsFrom.forEach((item) => {
    if (artistsTo.indexOf(item) !== -1) {
      artistMatches.push(item);
    }
  });

  const result = await getArtistsByIds(
    uidFrom,
    token,
    removeDuplicates(artistMatches)
  );

  res.jsonp(result);
};

async function getArtistsByIds(uid, token, ids) {
  const api = new YMApi();
  try {
    await api.init({ uid, access_token: token });
    const artistsFull = await api.getArtists(ids);

    return artistsFull.map((item) => ({
      id: item.id,
      name: item.name,
      ratings: item.ratings,
      avatar: item.cover?.uri,
    }));
  } catch (err) {
    console.log(err);
  }
}

async function getTracksAndArtists(uid, token) {
  const api = new YMApi();
  try {
    //Инициализируем АПИ Яндекса
    await api.init({ access_token: token, uid: uid });
    //Получаем треки из любимых треков и плейлистов
    const [likedTracks, playlistTracks] = await Promise.all([
      api.getLikedTracks(),
      api.getUserPlaylists(),
    ]);
    const { tracks } = likedTracks.library;
    //вытаскиваем треки из плейлистов, тк нам приходим массив массивов, т.е. плейлистов
    const playlistsIds = playlistTracks.map((item) => item.kind);
    const playlists = await api.getPlaylists(playlistsIds);

    //ОБЯЗАТЕЛЬНО! обраезаем количество треков, иначе запрос будет выполняться долго
    const anotherTracks = playlists.map((item) =>
      item.tracks.slice(0, process.env.MAX_PLAYLIST_TRACKS)
    );

    //смешиваем все в один массив
    const allTracks = [...tracks, ...mergeArrays(anotherTracks)];

    //парсим треки, чтобы вытащить артистов
    let parsedTracks = await Promise.all(
      allTracks.map(async (t) => (await api.getTrack(t.id))[0])
    );
    //оставляем только музыку
    parsedTracks = parsedTracks.filter((item) => item.type === 'music');
    //получаем артистов
    const artistsIds = [
      ...mergeArrays(parsedTracks.map((item) => item.artists)),
    ].map((artist) => artist.id);

    return { artists: artistsIds, tracks: allTracks };
  } catch (err) {
    console.log(err);
    return null;
  }
}

function countArtists(arr) {
  const freq = {};
  arr.forEach((item) => {
    freq[item] = (freq[item] || 0) + 1;
  });
  const sortedFreqkeys = Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .splice(0, 3);

  return sortedFreqkeys;
}
