const request = require('supertest');
const assert = require('assert');
const Profile = require('./../models/profileModel');
const { app } = require('../index');

const TEST_TOKEN = 'AQAAAAAM9VbIAAfGudxNb2fmVEsztCvYvl-Pcuw';

describe('Auth/Profile API', () => {
  it('should create profile', function (done) {
    Profile.deleteOne({ yandexId: 'test_id' }).then((err) => {
      request(app)
        .post('/api/profile')
        .send({
          yandexId: 'test_id',
          name: 'БАБКА_в_кеДах',
          birthdayDate: '1993-12-21T00:00:00.000+00:00',
          email: '',
          avatar: '/uploads/angelina-jolie-andzhelina-3783.jpg',
          genderId: '623e2e0a68d5e31be4c6368f',
        })
        .expect((res) => {
          const { data } = res.body;
          assert.equal(
            data.yandexId,
            'test_id',
            'Your profile has not been found'
          );
        })
        .end(done);
    });
  });
  it('should return me-profile', function (done) {
    request(app)
      .get('/auth/me')
      .set({ Authorization: `OAuth ${TEST_TOKEN}` })
      .expect((res) => {
        const { data } = res.body;
        assert.equal(
          data._id,
          '62437f4485bb3ae21d1834cb',
          'Your profile has not been found'
        );
      })
      .end(done);
  });
});
