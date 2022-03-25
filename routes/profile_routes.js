module.exports = function (app, db) {
  app.post('/profile', (req, res) => {
    console.log(req.body);
    res.send('Hello');
  });
};
