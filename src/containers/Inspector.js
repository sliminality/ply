// @flow
import React, { Component } from 'react';
import omit from 'lodash/omit';
import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import './Inspector.css';

type Props = {
  requestStyles: (nodeId: NodeId) => void,
  requestHighlight: (nodeId: NodeId) => void,
  rootNode: Node,
  nodes: NodeMap,
  styles: { [NodeId]: Object },
};

class Inspector extends Component {
  props: Props;
  state: {
    selected: { [NodeId]: Node },
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      selected: {},
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    /**
     * Automatically select the received node,
     * if it's the only one selected.
     */
    const noneSelected = Object.keys(this.state.selected).length === 0;
    const isNewRoot = this.props.rootNode !== nextProps.rootNode;

    // Clear selected state, only select new root.
    if (isNewRoot) {
      const newRoot: Node = nextProps.rootNode;
      this.setState({
        selected: {},
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.rootNode !== this.props.rootNode) {
      this.toggleSelected(this.props.rootNode.nodeId);
    }
  }

  resolveNode(nodeId: NodeId): Node {
    return this.props.nodes[nodeId];
  }

  highlightNode = (nodeId: NodeId): void => {
    this.props.requestHighlight(nodeId);
  };

  toggleSelected = (nodeId: NodeId): void => {
    const { selected } = this.state;
    let nextState;
    if (this.isSelected(nodeId)) {
      nextState = {
        selected: omit(selected, [nodeId]),
      };
    } else {
      const node = this.resolveNode(nodeId);
      nextState = {
        selected: {
          ...selected,
          [nodeId]: node,
        },
      };
      // Fetch styles for selected node if needed.
      if (!this.props.styles[nodeId]) {
        this.props.requestStyles(nodeId);
      }
    }
    // TODO: This will get dicey if the request fails.
    this.setState(nextState);
  };

  isSelected = (nodeId: NodeId): boolean => {
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
      highlightNode: this.highlightNode,
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
