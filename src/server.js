const port = 1111;
const io = require('socket.io')().attach(port);

/**
 * Namespaces
 *   /browser - for browser clients (Chrome extension)
 *   /app - for clients requesting info from browsers
 */
const browsers = io.of('/browsers');
const apps = io.of('/apps');

let browserConnections = new Set();
let appConnections = new Set();

browsers.on('connect', browser => {
  const socketId = browser.id;
  if (browserConnections.has(socketId)) {
    throw new Error('tried to connect a socket already added');
  }

  browserConnections.add(socketId);
  console.log('Connected to browser', socketId);
  console.log('Total apps:', appConnections.size);
  console.log('Total browsers:', browserConnections.size);

  /**
   * When browser clients provide responses, we need to forward
   * to the app clients.
   */
  browser.on('data.res', res => {
    console.dir(res);
    // Refactor this to support multiple clients.
    apps.emit('data.res', res);
  });

  browser.on('data.err', err => {
    console.log(err);
    apps.emit('data.err', err);
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
 * When app clients send requests, we need to forward
 * to the browser client.
 */
apps.on('connect', app => {
  const socketId = app.id;
  if (appConnections.has(socketId)) {
    throw new Error('tried to connect a app already added');
  }
  appConnections.add(socketId);
  console.log('Connected to app', socketId);
  console.log('Total apps:', appConnections.size);
  console.log('Total browsers:', browserConnections.size);

  /**
   * When app clients send requests, we need to forward
   * to the browser clients.
   */
  app.on('data.req', req => {
    if (browserConnections.size > 0) {
      console.dir(req);
      browsers.emit('data.req', req);
    } else {
      console.error('No available browser clients');
      // If there are no connected browser clients, return
      // an error to the requesting app.
      app.emit('server.err', {
        type: 'SERVER_ERROR',
        id: req.id,
        message: 'No available browsers',
      });
    }
  });

  app.on('disconnect', () => {
    if (appConnections.has(socketId)) {
      appConnections.delete(socketId);
      console.log('Disconnected from app', socketId);
      console.log('Total apps:', appConnections.size);
    } else {
      throw new Error('tried to disconnect a app that didnt exist');
    }
  });
});
