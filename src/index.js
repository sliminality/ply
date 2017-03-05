import React from 'react';
import ReactDOM from 'react-dom';
import SocketWrapper from './containers/SocketWrapper';
import App from './containers/App/App';
import './index.css';

ReactDOM.render(
  <SocketWrapper>
    <App />
  </SocketWrapper>,
  document.getElementById('root')
);
