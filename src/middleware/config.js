// @flow @format

const config = {
  socketPort: 1111,
  // $FlowFixMe - no annotation so we can import from server
  socketURL: port => `http://localhost:${port}/apps`,
  socketOptions: {
    reconnectionAttempts: 5,
  },
  server: {
    logVerbose: false,
    truncateLength: 50,
  },
};

module.exports = config;
