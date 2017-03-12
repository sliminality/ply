const port = 1111;
const io = require('socket.io')().attach(port);

/**
 * Namespaces
 *   /browser - for browser clients (Chrome extension)
 *   /frontend - for clients requesting info from browsers
 */
const browsers = io.of('/browsers');
const frontends = io.of('/frontends');

let browserConnections = new Set();
let frontendConnections = new Set();

browsers.on('connect', browser => {
  const socketId = browser.id;
  if (browserConnections.has(socketId)) {
    throw new Error('tried to connect a socket already added');
  }

  browserConnections.add(socketId);
  console.log('Connected to browser', socketId);
  console.log('Total frontends:', frontendConnections.size);
  console.log('Total browsers:', browserConnections.size);

  /**
   * When browser clients provide responses, we need to forward
   * to the frontend clients.
   */
  browser.on('data.res', res => {
    console.dir(res);
    // Refactor this to support multiple clients.
    frontends.emit('data.res', res);
  });

  browser.on('data.err', err => {
    console.log(err);
    frontends.emit('data.err', err);
  });

  browser.on('disconnect', () => {
    if (browserConnections.has(socketId)) {
      browserConnections.delete(socketId);
      console.log('Disconnected from browser', socketId);
      console.log('Total browsers:', browserConnections.size);
    } else {
      throw new Error('tried to disconnect a socket that didnt exist');
    }
  });
});

/**
 * When frontend clients send requests, we need to forward
 * to the browser client.
 */
frontends.on('connect', frontend => {
  const socketId = frontend.id;
  if (frontendConnections.has(socketId)) {
    throw new Error('tried to connect a frontend already added');
  }
  frontendConnections.add(socketId);
  console.log('Connected to frontend', socketId);
  console.log('Total frontends:', frontendConnections.size);
  console.log('Total browsers:', browserConnections.size);

  /**
   * When frontend clients send requests, we need to forward
   * to the browser clients.
   */
  frontend.on('data.req', req => {
    if (browserConnections.size > 0) {
      console.dir(req);
      browsers.emit('data.req', req);
    } else {
      console.error('No available browser clients');
      // If there are no connected browser clients, return
      // an error to the requesting frontend.
      frontend.emit('server.err', {
        type: 'SERVER_ERROR',
        id: req.id,
        message: 'No available browser clients',
      });
    }
  });

  frontend.on('disconnect', () => {
    if (frontendConnections.has(socketId)) {
      frontendConnections.delete(socketId);
      console.log('Disconnected from frontend', socketId);
      console.log('Total frontends:', frontendConnections.size);
    } else {
      throw new Error('tried to disconnect a frontend that didnt exist');
    }
  });
});
