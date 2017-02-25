// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Perseus</h2>
        </header>
        <SplitPane className="SplitPane-content"
                   split="vertical"
                   minSize={50}
                   defaultSize={100}>
          <div>One</div>
          <div>Two</div>
        </SplitPane>
      </div>
    );
  }
}

export default App;
