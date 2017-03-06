// @flow
import React, { Component } from 'react';
import Codeblock from 'react-uikit-codeblock';
import SplitPane from 'react-split-pane';
import DOMViewer from '../DOMViewer/DOMViewer';
import TreeView from 'react-treeview';
import codeExample from './codeExample';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <SplitPane split="vertical"
                   minSize={50}
                   defaultSize={400}
        >
          <DOMViewer root={this.props.node} />
          <Codeblock scroll="auto">{codeExample.css}</Codeblock>
        </SplitPane>
      </div>
    );
  }
}

export default App;
