const uuid = require('node-uuid');
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

// io.on('connection', client => {
//   const clientId = client.id;
//   io.sessions.add(clientId);
//   console.log('Client connected:', clientId);
//   console.log(io.sessions.size, 'clients');

//   client.on('ui.request.node', ({ id, selector }) => {
//     console.log(`[${id}]`, 'UI requested node', selector);
//     if (io.sessions.size < 2) {
//       io.emit('server.response.error', ({
//         id,
//         name: 'HostError',
//         message: 'Chrome extension not connected',
//       }));
//       return;
//     }
//     io.requests.add(id);
//     io.emit('server.request.node', ({ id, selector }));
//   });

//   client.on('ui.request.styles', ({ id, nodeId }) => {
//     console.log(`[${id}]`, 'UI requested styles for node', nodeId);
//     if (io.sessions.size < 2) {
//       io.emit('server.response.error', ({
//         id,
//         name: 'HostError',
//         message: 'Chrome extension not connected',
//       }));
//       return;
//     }
//     io.requests.add(id);
//     io.emit('server.request.styles', ({ id, nodeId }));
//   });

//   client.on('ext.response.node', ({ id, node }) => {
//     io.requests.delete(id);
//     console.log(`[${id}]`, 'Extension responsed with node', node);
//     io.emit('server.response.node', ({ id, node }));
//   });

//   client.on('ext.response.styles', ({ id, styles }) => {
//     io.requests.delete(id);
//     console.log(`[${id}]`, 'Extension responded with styles', styles);
//     io.emit('server.response.styles', ({ id, styles }));
//   });

//   client.on('ext.response.error', ({ id, name, message }) => {
//     io.requests.delete(id);
//     console.log(`[${id}]`, 'Extension responded with', name, message);
//     io.emit('server.response.error', ({ id, name, message }));
//   });

//   client.on('disconnect', () => {
//     io.sessions.delete(clientId);
//     console.log('Client disconnected:', clientId);
//     console.log(io.sessions.size, 'clients remaining');
//   });
// });
