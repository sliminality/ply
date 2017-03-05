// @flow
import React, { Component } from 'react';
import uikit from 'react-uikit-base';
import Codeblock from 'react-uikit-codeblock';
import SplitPane from 'react-split-pane';
import SocketWrapper from '../SocketWrapper';
import DOMExplorer from '../../components/DOMExplorer/DOMExplorer';
import codeExample from './codeExample';
import './App.css';

class App extends Component {
  render() {
    return (
      <SocketWrapper>
        <div className="App">
          <SplitPane split="vertical"
                     minSize={50}
                     defaultSize={400}
          >
            <DOMExplorer code={codeExample.html} />
            <div>
              <Codeblock scroll="auto">{codeExample.css}</Codeblock>
            </div>
          </SplitPane>
        </div>
      </SocketWrapper>
    );
  }
}

export default uikit.base(App);
