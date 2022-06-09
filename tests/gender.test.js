const assert = require('assert');
const request = require('supertest');
const { app } = require('../index');

describe('Gender API', () => {
  it('should return male and female genders', function (done) {
    request(app)
      .get('/api/gender')
      .expect((res) => {
        const [g1, g2] = res.body.data;
        assert.notEqual(g1, null);
        assert.notEqual(g2, null);
      })
      .end(done);
  });
});
