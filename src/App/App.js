// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import codeExample from './codeExample';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <SplitPane className="SplitPane-content"
                   split="vertical"
                   minSize={50}
                   defaultSize={400}>
          <div><pre className="code-block">{codeExample.html}</pre></div>
          <div><pre className="code-block">{codeExample.css}</pre></div>
        </SplitPane>
      </div>
    );
  }
}

export default App;
