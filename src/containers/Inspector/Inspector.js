// @flow
import React, { Component } from 'react';
import Codeblock from 'react-uikit-codeblock';
import SplitPane from 'react-split-pane';
import DOMViewer from '../../components/DOMViewer/DOMViewer';
import { setMinus, setPlus } from '../../utils/state';
import './Inspector.css';

class Inspector extends Component {
  props: {
    requestData: (Object) => void,
    rootNode: Node,
    styles: { [id: number]: Object },
  };

  state: {
    selected: Set<number>,
  };

  constructor(props) {
    super(props);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.isSelected = this.isSelected.bind(this);

    this.state = {
      selected: new Set(),
    };
  }

  requestStyles(nodeId: number): void {
    this.props.requestData({
      type: 'REQUEST_STYLES',
      nodeId,
    });
  }

  toggleSelected(nodeId: number): void {
    let nextState;
    if (this.isSelected(nodeId)) {
      nextState = {
        selected: setMinus(this.state.selected, nodeId),
      };
    } else {
      nextState = {
        selected: setPlus(this.state.selected, nodeId),
      };
      this.requestStyles(nodeId);
    }
    // TODO: This will get dicey if the request fails.
    this.setState(nextState);
  }

  isSelected(nodeId: number): boolean {
    return this.state.selected.has(nodeId);
  }

  render() {
    const { rootNode, styles } = this.props;
    const selectedStyles = Object.keys(styles)
      .map(nodeId => (
        <Codeblock key={nodeId}>
          {JSON.stringify(styles[nodeId], null, 2)}
        </Codeblock>
      ));
    const splitPaneProps = {
      split: 'vertical',
      minSize: 50,
      defaultSize: 400,
    };
    const domViewerProps = {
      rootNode,
      toggleSelected: this.toggleSelected,
      isSelected: this.isSelected,
    };

    return (
      <div className="Inspector">
        <SplitPane {...splitPaneProps}>
          <DOMViewer {...domViewerProps} />
          {selectedStyles.length ? selectedStyles : 'hi'}
        </SplitPane>
      </div>
    );
  }
}

export default Inspector;
