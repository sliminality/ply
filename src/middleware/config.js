// @flow

const config = {
  socketPort: 1111,
  socketURL: (port: number) => `http://localhost:${port}/apps`,
  socketOptions: {
    reconnectionAttempts: 5,
  },
};

export default config;
