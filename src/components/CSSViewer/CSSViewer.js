// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import Codeblock from 'react-uikit-codeblock';

class CSSViewer extends Component {
  props: {
    styles: { [nodeId: number]: Object },
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { styles } = this.props;
    const selectedStyles = Object.keys(styles)
      .map(nodeId => (
        <Codeblock key={nodeId}>
          {JSON.stringify(styles[nodeId], null, 2)}
        </Codeblock>
      ));

    return (
      <div className="CSSViewer">
        {selectedStyles.length ? selectedStyles : 'hi'}
      </div>
    );
  }
}

export default CSSViewer;
