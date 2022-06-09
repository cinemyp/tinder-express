const request = require('supertest');
const assert = require('assert');
const Like = require('./../models/likeModel');
const Dialog = require('./../models/dialogModel');
const { app } = require('../index');

const USER_ID = '62461f331853c78043ed2248';
const LIKED_USER_ID = '62437f4485bb3ae21d1834cb';

describe('Like API', () => {
  it('no like. should return NO match result', function (done) {
    Like.deleteOne({ likedUserId: USER_ID, userId: LIKED_USER_ID }).then(
      (err) => {
        request(app)
          .post('/api/like')
          .send({
            userId: USER_ID,
            likedUserId: LIKED_USER_ID,
          })
          .expect((res) => {
            const { match } = res.body;
            assert.equal(match, false, 'It was match, remove old likes');
          })
          .end(done);
      }
    );
  });
  it('has like. should return NO match result', function (done) {
    request(app)
      .post('/api/like')
      .send({
        userId: USER_ID,
        likedUserId: LIKED_USER_ID,
      })
      .expect((res) => {
        const { match } = res.body;
        assert.equal(match, false, 'It was match, remove old likes');
      })
      .end(done);
  });
  it('should return MATCH result', function (done) {
    Dialog.deleteMany({ toId: USER_ID, fromId: LIKED_USER_ID }).then((err) => {
      request(app)
        .post('/api/like')
        .send({
          userId: LIKED_USER_ID,
          likedUserId: USER_ID,
        })
        .expect((res) => {
          const { match } = res.body;
          assert.equal(match, true, 'It was NO match, clean old likes');
        })
        .end(done);
    });
  });
});
