// @flow
import React, { Component } from 'react';
import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import { deleteIn } from '../utils/state';
import './Inspector.css';

class Inspector extends Component {
  props: {
    requestData: (Object) => void,
    rootNode: Node,
    styles: { [nodeId: string]: Object },
  };

  state: {
    selected: { [nodeId: string]: Node },
  };

  constructor(props) {
    super(props);
    this.toggleSelected = this.toggleSelected.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.parents = new WeakMap();

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

  resolveNode(nodeId: number): {
    node: Node, parentId: number
  } {
    const { rootNode } = this.props;
    const queue = [ rootNode ];
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

  toggleSelected(nodeId: number): void {
    const { selected } = this.state;
    let nextState;
    if (this.isSelected(nodeId)) {
      nextState = {
        selected: deleteIn(selected, nodeId),
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
  }

  isSelected(nodeId: number): boolean {
    return this.state.selected[nodeId];
  }

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
