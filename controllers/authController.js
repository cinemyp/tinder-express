const request = require('request');
const axios = require('axios');
const Profile = require('../models/profileModel');
const Gender = require('../models/genderModel');

/**
 * Метод аутентификации через Яндекс.Паспорт
 * Получаем url для перехода к авторизации
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.auth = (req, res, next) => {
  request(
    `https://oauth.yandex.ru/authorize?response_type=code&client_id=${process.env.CLIENT_ID}`,

    (err, response, body) => {
      if (err) return res.status(500).send({ message: err });

      return res.json(response.request.uri.href);
    }
  );
};

/**
 * Колбэк на авторизацию/регистрацию пользователя
 * Возвращает нам токен
 * @param {*} req
 * @param {*} res
 */
exports.callback = (req, res) => {
  //TODO: заменить на .params
  const code = parseCode(req);

  request.post(
    {
      url: 'https://oauth.yandex.ru/token',
      formData: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
    },
    async (err, response, body) => {
      if (err) return res.status(500).send({ message: err });
      //TODO: Обработать ошибку с запроса
      const tokenData = parseJson(body);
      try {
        const result = await getUser(tokenData.access_token, registrate);
        return res.jsonp({ ...tokenData, ...result });
      } catch (err) {
        console.log(err);
      }
    }
  );
};

/**
 * Метод получения данных о пользователе
 * @param {*} req
 * @param {*} res
 */
exports.me = (req, res) => {
  const token = parseToken(req);
  getUser(token, async (body) => {
    const { id } = body;
    try {
      let profile = await Profile.findOne({ yandexId: id });
      if (!profile) {
        res.status(404).send({ message: 'User has not found' });
      } else {
        res.jsonp({ data: profile });
      }
    } catch (err) {
      console.error(err);
    }
  });
};

/**
 * Метод перенаправления в приложения, после успешной авторизации/регистрации
 * @param {*} req
 * @param {*} res
 */
exports.success = (req, res) => {
  res.redirect('exp://127.0.0.1:19000/');
};

/**
 * Доп метод регистрации пользователя
 * Берет данные из профиля Яндекса и создает профиль в БД
 * @param {*} body
 * @returns
 */
async function registrate(body) {
  const { id, first_name, sex, birthday } = body;
  try {
    let profile = await Profile.findOne({ yandexId: id });
    if (profile) {
      return { registrated: true };
    } else {
      //Registration
      const gender = await Gender.findOne({
        name: sex,
      }).exec();

      const newProfile = {
        yandexId: id,
        name: first_name,
        avatar: '',
        birthdayDate: birthday,
        email: '',
        genderId: gender._id,
        thumbnail: '',
      };
      await Profile.create(newProfile);
      return { registrated: false };
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Метод, который обращается за данными о пользователе
 * @param {*} token
 * @param {*} callback
 */
async function getUser(token, callback) {
  axios.defaults.headers.common['Authorization'] = 'OAuth ' + token;
  return await axios.get('https://login.yandex.ru/info').then(async (res) => {
    try {
      const result = await callback(res.data);
      return result;
    } catch (err) {
      console.log(err);
    }
  });
}

function parseJson(body) {
  return JSON.parse(body);
}

function parseToken(req) {
  return req.headers.authorization.split(' ')[1];
}
function parseCode(req) {
  return req.url.match(/code=(.*)/)[1];
}
