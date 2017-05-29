// @flow
import React, { Component } from 'react';
import omit from 'lodash/omit';
import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import './Inspector.css';

type Props = {
  requestData: Object => void,
  rootNode: Node,
  styles: { [nodeId: string]: Object },
};

class Inspector extends Component {
  props: Props;

  state: {
    selected: { [nodeId: string]: Node },
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      selected: {},
    };
  }

  componentWillReceiveProps() {
    /**
     * Automatically select the received node,
     * if it's the only one selected.
     */
    const { rootNode } = this.props;
    const { selected } = this.state;
    const noneSelected = Object.keys(selected).length === 0;

    if (noneSelected) {
      if (rootNode) {
        this.toggleSelected(rootNode.nodeId);
      }
    }
  }

  requestStyles(nodeId: number): void {
    this.props.requestData({
      type: 'REQUEST_STYLES',
      nodeId,
    });
  }

  resolveNode(nodeId: number): NodeWithParent {
    const { rootNode } = this.props;
    const queue = [rootNode];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node.nodeId === nodeId) {
        return node;
      }
      if (node.children) {
        queue.push(...node.children);
      }
    }
    throw new Error('Could not resolve node for', nodeId);
  }

  toggleSelected = (nodeId: number): void => {
    const { selected } = this.state;
    let nextState;
    if (this.isSelected(nodeId)) {
      nextState = {
        selected: omit(selected, ['nodeId']),
      };
    } else {
      const node = this.resolveNode(nodeId);
      nextState = {
        selected: {
          ...selected,
          [nodeId]: node,
        },
      };
      this.requestStyles(nodeId);
    }
    // TODO: This will get dicey if the request fails.
    this.setState(nextState);
  };
  isSelected = (nodeId: number): boolean => {
    return !!this.state.selected[nodeId];
  };
  render() {
    const { rootNode, styles } = this.props;
    const { selected } = this.state;
    const splitPaneProps = {
      split: 'vertical',
      minSize: 250,
      defaultSize: '33%',
      primary: 'second',
    };
    const domViewerProps = {
      rootNode,
      toggleSelected: this.toggleSelected,
      isSelected: this.isSelected,
    };
    const cssViewerProps = {
      selected,
      styles,
    };

    return (
      <div className="Inspector">
        <SplitPane {...splitPaneProps}>
          <DOMViewer {...domViewerProps} />
          <StyleViewer {...cssViewerProps} />
        </SplitPane>
      </div>
    );
  }
}

export default Inspector;
