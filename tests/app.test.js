const request = require('supertest');
const { app } = require('../index');

it('should return API connect is OK', function (done) {
  request(app).get('/api/').expect(200).end(done);
});
