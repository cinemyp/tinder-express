const request = require('supertest');
const assert = require('assert');
const Profile = require('./../models/profileModel');
const { app } = require('../index');

describe('Profile API', () => {
  it('should return profiles', function (done) {
    this.timeout(5000);
    request(app)
      .get('/api/profile')
      .query({ userId: '62a21514c2ecc122431b626d' })
      .expect(200)
      .expect((res) => {
        const data = res.body;
        assert.equal(Array.isArray(data), true);
      })
      .end(done);
  });
});
