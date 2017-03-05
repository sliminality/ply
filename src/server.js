const Server = require('socket.io');
const uuid = require('node-uuid');

const port = 8090;
const io = new Server().attach(port);
const sessions = new Set();
const requests = new Set();

io.on('connection', client => {
  const clientId = client.id;
  sessions.add(clientId);
  console.log('Client connected:', clientId);

  // Handle client emitting requests for DOM
  client.on('ui.request.DOM', ({ id, selector }) => {
    requests.add(id);
    console.log(`[${id}]`, 'UI requested node', selector);
    io.emit('server.request.DOM', ({ id, selector }));
  });

  // Handle client emitting requests for DOM
  client.on('ui.request.styles', ({ id, nodeId }) => {
    requests.add(id);
    console.log(`[${id}]`, 'UI requested styles for node', nodeId);
    io.emit('server.request.styles', ({ id, nodeId }));
  });

  client.on('ext.response.DOM', ({ id, node }) => {
    requests.delete(id);
    console.log(`[${id}]`, 'Extension responsed with node', node);
    io.emit('server.response.DOM', ({ id, node }));
  });

  client.on('ext.response.styles', ({ id, styles }) => {
    requests.delete(id);
    console.log(`[${id}]`, 'Extension responded with styles', styles);
    io.emit('server.response.styles', ({ id, styles }));
  });

  // client.on('got nodes', ({ root }) => {
  //   console.log('got node from browser');
  //   client.emit('chrome node', { root });
  // });

  client.on('disconnect', () => {
    sessions.delete(clientId);
    console.log('Client disconnected:', clientId);
  });
});
