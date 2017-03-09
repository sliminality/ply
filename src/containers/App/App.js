// @flow
import React, { Component } from 'react';
import Codeblock from 'react-uikit-codeblock';
import SplitPane from 'react-split-pane';
import DOMViewer from '../DOMViewer/DOMViewer';
import TreeView from 'react-treeview';
import './App.css';

class App extends Component {
  render() {
    const selectedStyles = Object.keys(this.props.styles)
      .map(nodeId => (
        <Codeblock key={nodeId}>
          {JSON.stringify(this.props.styles[nodeId].matchedCSSRules.map(r => r.rule.style.cssProperties), null, 2)}
        </Codeblock>
      ));
    // const selectedStyles = JSON.stringify(this.props.styles, null, 2);
    return (
      <div className="App">
        <SplitPane split="vertical"
                   minSize={50}
                   defaultSize={400}
        >
          <DOMViewer root={this.props.node}
                     requestStyles={this.props.requestStyles}
          />
          <SplitPane split="horizontal"
                     minSize={500}
          >
            {selectedStyles.length ? selectedStyles : 'hi'}
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

export default App;
