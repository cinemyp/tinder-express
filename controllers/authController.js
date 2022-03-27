const authUrl = 'https://oauth.yandex.ru/authorize?';

exports.redirect = (req, res) => {
  console.log('redirect');
  res.redirect(
    `https://oauth.yandex.ru/authorize?response_type=code&client_id=${process.env.CLIENT_ID}`
  );
};

exports.token = (req, res) => {
  console.log('token');
};

exports.auth = (req, res) => {};
