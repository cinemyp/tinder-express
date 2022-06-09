const request = require('supertest');
const assert = require('assert');
const Dialog = require('./../models/dialogModel');
const { app } = require('../index');
const { onConnection } = require('../socket');

const createServer = require('http').createServer;
const Client = require('socket.io-client').io;
const Server = require('socket.io').Server;

const CLIENT_ID_FROM = '62461f331853c78043ed2248';
const CLIENT_ID_TO = '62437f4485bb3ae21d1834cb';

describe('Msg API', () => {
  let io, serverSocket, clientSocket;

  beforeEach((done) => {
    const httpServer = createServer(app);
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`, {
        auth: { customId: CLIENT_ID_FROM },
      });
      clientSocketTo = new Client(`http://localhost:${port}`, {
        auth: { customId: CLIENT_ID_TO },
      });
      io.on('connection', (socket) => {
        serverSocket = socket;
        onConnection(io, socket);
      });
      clientSocket.on('connection', () => {
        Dialog.deleteMany({ toId: CLIENT_ID_TO, fromId: CLIENT_ID_FROM }).then(
          (err) => {
            done();
          }
        );
      });
    });
  });

  afterEach(() => {
    io.close();
    clientSocket.close();
  });

  // it('should work', (done) => {
  //   clientSocket.on('hello', (arg) => {
  //     assert.equal(arg, 'world');
  //     done();
  //   });
  //   serverSocket.emit('hello', 'world');
  // });

  it('should return no dialogs', (done) => {
    clientSocket.on('dialogs:send', (data) => {
      assert.equal(Array.isArray(data), true, 'Non Array answer');
      done();
    });
    clientSocket.emit('dialogs:get', CLIENT_ID_FROM);
  });

  it('should return some dialogs', (done) => {
    Dialog.create({
      toId: CLIENT_ID_TO,
      fromId: CLIENT_ID_FROM,
    }).then((err) => {
      clientSocket.on('dialogs:send', (data) => {
        assert.equal(Array.isArray(data), true, 'Non Array answer');
        done();
      });
      clientSocket.emit('dialogs:get', CLIENT_ID_FROM);
    });
  });
  it('should return NO msg', (done) => {
    Dialog.create({
      toId: CLIENT_ID_TO,
      fromId: CLIENT_ID_FROM,
    }).then((err) => {
      clientSocket.on('msg:update', (msgs) => {
        assert.equal(Array.isArray(msgs), true, 'Non Array answer');
        done();
      });
      clientSocket.emit('msg:get', err._id);
    });
  });
  it('should return SOME msg', (done) => {
    Dialog.create({
      toId: CLIENT_ID_TO,
      fromId: CLIENT_ID_FROM,
    }).then((err) => {
      clientSocket.on('msg:update', (msgs) => {
        assert.equal(Array.isArray(msgs), true, 'Non Array answer');
        const msg = msgs[0];
        assert.equal(msg.text, 'New Message', 'Non equal msg text');
        done();
      });
      clientSocketTo.emit('dialogs:join', err._id);
      clientSocket.emit('dialogs:join', err._id);

      clientSocketTo.emit(
        'msg:send',
        err._id.toString(),
        CLIENT_ID_TO,
        CLIENT_ID_FROM,
        'New Message'
      );
    });
  });
});
