const Profile = require('../models/profileModel');
const { YMApi } = require('ym-api');
const {
  parseToken,
  mergeArrays,
  removeDuplicates,
  getDuplicates,
  getUniqArray,
  getAvg,
  getBaseLog,
} = require('../utils');
let genres = [];
exports.index = async (req, res) => {
  const api = new YMApi();
  try {
    const token = parseToken(req);
    const { uid } = req.params;
    await api.init({ access_token: token, uid: uid });
    const result = await api.getGenres();
    genres = [...result, ...mergeArrays(result.map((item) => item.subGenres))];
    res.jsonp({ status: true });
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

    const response = await getMusicLibraryInfo(uid, token);
    if (!response) {
      return res.jsonp({ status: false });
    }
    const { artists: artistsIds, tracks, genres: genresTitles } = response;
    //считаем количество вхождений и получаем популярных
    const data = countArtists(artistsIds);

    const artists = await api.getArtists(data);
    const topArtists = artists.map((item) => ({
      id: item.id,
      name: item.name,
      ratings: item.ratings,
      uri: 'https://' + item.cover?.uri.replace('%%', '150x150'),
    }));
    const topGenres = genresTitles.slice(0, 3).map((item) =>
      genres.find((g) => {
        return g?.id === item;
      })
    );
    console.log(genresTitles.slice(0, 3));
    const result = {
      topArtists,
      topGenres,
    };
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
    getMusicLibraryInfo(uidFrom, token),
    getMusicLibraryInfo(uidTo, token),
  ]);

  if (userDataFrom === null || userDataTo === null) {
    return res.jsonp({ status: false });
  }
  const {
    artists: artistsFromAll,
    tracks: tracksFrom,
    genres: genresFrom,
  } = userDataFrom;
  const {
    artists: artistsToAll,
    tracks: tracksTo,
    genres: genresTo,
  } = userDataTo;

  //const len = Math.min(artistsFromAll.length, artistsToAll.length);

  const artistsFrom = removeDuplicates(artistsFromAll);
  const artistsTo = removeDuplicates(artistsToAll);

  //Количество совпадений по артистам
  const artistMatches = getDuplicates(artistsFrom, artistsTo);
  const uniqArtistsCount = getUniqArray(artistsFrom, artistsTo).length;
  //коэффициент перераспределения
  const artistCoef =
    2 -
    Math.min(artistsFrom.length, artistsTo.length) /
      Math.max(artistsFrom.length, artistsTo.length);
  const artistsMatchesData = await getArtistsByIds(
    uidFrom,
    token,
    artistMatches
  );

  const ratings = artistsMatchesData.map((item) =>
    getArtistRatingCoef(item.ratings)
  );
  const ratingCoef = 1 + getAvg(ratings) / Math.max(...ratings);
  const artistsPercentage = getBaseLog(
    uniqArtistsCount,
    artistMatches.length + 1
  );

  //количество совпадений по трекам
  const trackMatches = getDuplicates(
    tracksFrom.map((item) => +item.id),
    tracksTo.map((item) => +item.id)
  );

  const uniqTracksCount = getUniqArray(
    tracksFrom.map((item) => +item.id),
    tracksTo.map((item) => +item.id)
  ).length;
  const tracksPercentage = getBaseLog(uniqTracksCount, trackMatches.length + 1);

  const genresMatches = getDuplicates(genresFrom, genresTo);
  //считаем количество уникальных жанров
  const uniqGenresCount = removeDuplicates([...genresFrom, ...genresTo]).length;
  const genresPercentage = getBaseLog(
    uniqGenresCount,
    genresMatches.length + 1
  );
  const genresCoef =
    Math.min(genresFrom.length, genresTo.length) /
    Math.max(genresFrom.length, genresTo.length);

  console.log('genre:', genresPercentage * genresCoef);
  console.log('artists:', artistsPercentage);
  console.log('tracks:', tracksPercentage);

  const common =
    genresPercentage * genresCoef * 0.6 +
    artistsPercentage * artistCoef * ratingCoef * 0.3 +
    tracksPercentage * 0.1;

  res.jsonp({ common: common });
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

async function getMusicLibraryInfo(uid, token) {
  const api = new YMApi();
  try {
    //Инициализируем АПИ Яндекса
    await api.init({ access_token: token, uid: uid });
    //Получаем треки из любимых треков и плейлистов

    const [likedTracks, playlistTracks] = await Promise.all([
      api.getLikedTracks(),
      api.getUserPlaylists(),
    ]);

    if (likedTracks === 'private-library') {
      return false;
    }
    const { tracks } = likedTracks.library;

    //вытаскиваем треки из плейлистов, тк нам приходим массив массивов, т.е. плейлистов
    const playlistsIds = playlistTracks.map((item) => item.kind);
    const playlists = await api.getPlaylists(playlistsIds);
    //ОБЯЗАТЕЛЬНО! обраезаем количество треков, иначе запрос будет выполняться долго
    const anotherTracks = playlists.map((item) =>
      item.tracks.slice(0, process.env.MAX_PLAYLIST_TRACKS)
    );

    //смешиваем все в один массив
    const allTracks = [...tracks, ...mergeArrays(anotherTracks)].slice(0, 50);

    //парсим треки, чтобы вытащить артистов
    let parsedTracks = await Promise.all(
      allTracks.map(async (t) => (await api.getTrack(t.id))[0])
    );
    //оставляем только музыку
    parsedTracks = parsedTracks.filter((item) => item.type === 'music');
    //вытаскиваем жанры
    const genres = removeDuplicates(
      mergeArrays(parsedTracks.map((item) => item.albums)).map(
        (album) => album.genre
      )
    );
    //получаем артистов
    const artistsIds = [
      ...mergeArrays(parsedTracks.map((item) => item.artists)),
    ].map((artist) => +artist.id);

    return { artists: artistsIds, tracks: allTracks, genres: genres };
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

function getArtistRatingCoef(rating) {
  return (2 - 1 / 30) * rating.month + (2 - 1 / 7) * rating.week + rating.day;
}
