// @flow
import React, { Component } from 'react';
import omit from 'lodash/omit';
import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import './Inspector.css';

type Props = {
  requestStyles: NodeId => void,
  requestHighlight: ?NodeId => void,
  toggleCSSProperty: NodeId => (number) => (number) => void,
  pruneNode: NodeId => void,
  rootNode: Node,
  nodes: NodeMap,
  styles: { [NodeId]: Object },
};

class Inspector extends Component {
  props: Props;
  state: {
    selected: { [NodeId]: Node },
    settings: {
      inspectMultiple: boolean,
    },
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      selected: {},
      settings: {
        inspectMultiple: false,
      },
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.rootNode !== this.props.rootNode) {
      this.toggleSelected(this.props.rootNode.nodeId);
    }
  }

  resolveNode(nodeId: NodeId): Node {
    return this.props.nodes[nodeId];
  }

  toggleSelected = (nodeId: NodeId): void => {
    const { selected, settings } = this.state;
    let nextState;

    if (this.isSelected(nodeId)) {
      nextState = {
        selected: omit({ ...selected }, [nodeId]),
      };
    } else {
      let node: Node;

      if (nodeId === this.props.rootNode.nodeId) {
        node = this.props.rootNode;
      } else {
        node = this.resolveNode(nodeId);
      }

      nextState = {
        selected: {
          ...(settings.inspectMultiple ? selected : null),
          [nodeId]: node,
        },
      };

      // Fetch styles for selected node if needed.
      if (!this.props.styles[nodeId]) {
        this.props.requestStyles(nodeId);
      }
    }

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
      requestHighlight: this.props.requestHighlight,
    };
    const cssViewerProps = {
      selected,
      styles,
      toggleCSSProperty: this.props.toggleCSSProperty,
      pruneNode: this.props.pruneNode,
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
