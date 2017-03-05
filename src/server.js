const Server = require('socket.io');
const uuid = require('node-uuid');

const port = 8090;
const io = new Server().attach(port);
io.sessions = new Set();
io.requests = new Set();

io.on('connection', client => {
  const clientId = client.id;
  sessions.add(clientId);
  console.log('Client connected:', clientId);

  client.on('ui.request.node', ({ id, selector }) => {
    requests.add(id);
    console.log(`[${id}]`, 'UI requested node', selector);
    io.emit('server.request.node', ({ id, selector }));
  });

  client.on('ui.request.styles', ({ id, nodeId }) => {
    requests.add(id);
    console.log(`[${id}]`, 'UI requested styles for node', nodeId);
    io.emit('server.request.styles', ({ id, nodeId }));
  });

  client.on('ext.response.node', ({ id, node }) => {
    requests.delete(id);
    console.log(`[${id}]`, 'Extension responsed with node', node);
    io.emit('server.response.node', ({ id, node }));
  });

  client.on('ext.response.styles', ({ id, styles }) => {
    requests.delete(id);
    console.log(`[${id}]`, 'Extension responded with styles', styles);
    io.emit('server.response.styles', ({ id, styles }));
  });

  client.on('ext.response.error', ({ id, name, message }) => {
    requests.delete(id);
    console.log(`[${id}]`, 'Extension responded with', name, message);
    io.emit('server.response.error', ({ id, name, message }));
  });

  client.on('disconnect', () => {
    sessions.delete(clientId);
    console.log('Client disconnected:', clientId);
  });
});
