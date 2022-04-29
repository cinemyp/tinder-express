const request = require('request');

const Profile = require('../models/profileModel');
const Gender = require('../models/genderModel');

exports.auth = (req, res, next) => {
  request(
    `https://oauth.yandex.ru/authorize?response_type=code&client_id=${process.env.CLIENT_ID}`,

    (err, response, body) => {
      if (err) return res.status(500).send({ message: err });

      return res.json(response.request.uri.href);
    }
  );
};
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
      await getUser(tokenData.access_token, registrate);

      return res.jsonp(tokenData);
    }
  );
};

exports.me = (req, res) => {
  const token = parseToken(req);

  getUser(token, async (body) => {
    const { id } = parseJson(body);
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

exports.success = (req, res) => {
  res.redirect('exp://127.0.0.1:19000/');
};

async function registrate(body) {
  const { id, first_name, sex, birthday } = parseJson(body);
  try {
    let profile = await Profile.findOne({ yandexId: id });
    if (profile) {
      return;
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
    }
  } catch (err) {
    console.error(err);
  }
}

async function getUser(token, callback) {
  request.get(
    {
      url: 'https://login.yandex.ru/info',
      headers: {
        Authorization: 'OAuth ' + token,
      },
    },
    async (err, response, body) => {
      await callback(body);
    }
  );
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
