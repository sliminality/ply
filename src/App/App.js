// @flow
import React, { Component } from 'react';
import uikit from 'react-uikit-base';
import SplitPane from 'react-split-pane';
import DOMExplorer from '../DOMExplorer/DOMExplorer';
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
          <DOMExplorer code={codeExample.html} />
          <div>
            <pre><code className="css">{codeExample.css}</code></pre>
          </div>
        </SplitPane>
      </div>
    );
  }
}

export default uikit.base(App);
