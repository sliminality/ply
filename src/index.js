import React from 'react';
import ReactDOM from 'react-dom';
import SocketWrapper from './containers/SocketWrapper';
import Inspector from './containers/Inspector';
import './index.css';

ReactDOM.render(
  <SocketWrapper>
    <Inspector />
  </SocketWrapper>,
  document.getElementById('root')
);
