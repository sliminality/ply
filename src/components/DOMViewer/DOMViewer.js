// @flow @format
import React, { Component } from 'react';
import TreeView from 'react-treeview';
import Label from './ElementLabel';
import fromPairs from 'lodash/fromPairs';
import './DOMViewer.css';

import { connect } from 'react-redux';
import {
  getNodes,
  getSelectedNodes,
  getNodeById,
  getInspectionRoot,
} from '../../selectors';
import { toggleSelectNode, highlightNode, clearHighlight } from '../../actions';

import type {
  State as ReduxState,
  Dispatch,
  NormalizedNode,
  NormalizedNodeMap,
  InspectorSettings,
} from '../../types';
import type { NodeDisplayType } from './ElementLabel';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

// TODO: deprecate this in favor of inline styling
const nodeClassName = ({
  type,
  isSelected,
}: {
  type: NodeDisplayType,
  isSelected: boolean,
}): string => {
  let result = ['Node'];
  if (type === 'INLINE_LEAF' || type === 'LEAF') {
    result.push('Node--leaf');
  }
  if (isSelected) {
    result.push('Node--selected');
  }
  return result.join(' ');
};

type Props = {
  rootNode: Node,
  nodes: NormalizedNodeMap,
  selectedNodes: { [CRDP$NodeId]: boolean },
  settings: InspectorSettings,
  resolveNode: CRDP$NodeId => ?NormalizedNode,

  toggleSelectNode: CRDP$NodeId => void,
  highlightNode: CRDP$NodeId => void,
  clearHighlight: () => void,
};

type State = {
  expandedNodes: { [CRDP$NodeId]: boolean },
};

class DOMViewer extends Component<Props, State> {
  props: Props;
  state: State = {
    expandedNodes: {},
  };

  isExpanded = (nodeId: CRDP$NodeId): boolean => {
    const { expandedNodes } = this.state;
    return !!expandedNodes[nodeId];
  };

  toggleExpandNode = (nodeId: CRDP$NodeId) => {
    const { expandedNodes } = this.state;
    const isExpanded = this.isExpanded(nodeId);
    this.setState({
      expandedNodes: { ...expandedNodes, [nodeId]: !isExpanded },
    });
  };

  deepToggleExpandNode = (nodeId: CRDP$NodeId) => {
    const { resolveNode } = this.props;
    const { expandedNodes } = this.state;
    const toExpand = [nodeId];
    let node = resolveNode(nodeId);
    while (node && node.children && node.children.length === 1) {
      const firstChild = this.resolveFirstChild(node);
      if (!firstChild) {
        break; // This should never happen...
      }
      toExpand.push(firstChild.nodeId);
      node = firstChild;
    }
    const isMainNodeExpanded = this.isExpanded(nodeId);
    this.setState({
      expandedNodes: {
        ...expandedNodes,
        ...fromPairs(toExpand.map(nodeId => [nodeId, !isMainNodeExpanded])),
      },
    });
  };

  nodeDisplayType(nodeId: CRDP$NodeId): NodeDisplayType {
    // Types of nodes.
    // - Fork: a node with regular children. May be expanded/collapsed.
    // - Inline Leaf: a node with one child, a Value. Rendered with content inline.
    // - Value: a node with no children and a value, e.g. text.
    const { resolveNode } = this.props;
    const node = resolveNode(nodeId);
    if (!node) {
      throw new Error('tried to get type of nonexistent node');
    }
    const { children } = node;

    if (children && children.length > 0) {
      if (children.length > 1) {
        return 'FORK';
      }
      // One child; check if it has attributes.
      const firstChild = this.resolveFirstChild(node);
      return firstChild && firstChild.attributes ? 'FORK' : 'INLINE_LEAF';
    } else {
      // No children; check if there are attributes.
      // $FlowFixMe - Flow can't pick up the `attributes` field :\
      return node.attributes ? 'INLINE_LEAF' : 'LEAF';
    }
  }

  // Helper function to get the first child of a NormalizedNode,
  // used for various operations involving InlineLeaf nodes.
  resolveFirstChild = ({ children }: NormalizedNode): ?NormalizedNode => {
    const { resolveNode } = this.props;
    const childId = children && children[0];
    if (typeof childId === 'number') {
      return resolveNode(childId);
    }
    return null;
  };

  renderDOMNode = (nodeId: CRDP$NodeId) => {
    const {
      nodes,
      selectedNodes,
      clearHighlight,
      highlightNode,
      toggleSelectNode,
      settings,
    } = this.props;
    const { deepExpandNodes } = settings;
    const node = nodes[nodeId];
    if (!node) {
      console.error(
        'renderDOMNode: failed to resolve node',
        nodeId,
        'with node map',
        nodes,
      );
      return;
    }
    const type: NodeDisplayType = this.nodeDisplayType(nodeId);
    const className = nodeClassName({
      type,
      isSelected: !!selectedNodes[nodeId],
    });
    const label = (
      <Label
        node={node}
        nodeDisplayType={type}
        firstChild={this.resolveFirstChild(node)}
        toggleSelectNode={toggleSelectNode}
        highlightNode={highlightNode}
        clearHighlight={clearHighlight}
      />
    );
    switch (type) {
      case 'FORK':
        const { children } = node;
        return (
          <TreeView
            key={nodeId}
            nodeLabel={label}
            itemClassName={className}
            collapsed={!this.isExpanded(nodeId)}
            onClick={
              deepExpandNodes
                ? () => this.deepToggleExpandNode(nodeId)
                : () => this.toggleExpandNode(nodeId)
            }
          >
            {children && children.map(this.renderDOMNode)}
          </TreeView>
        );

      // Leaves and inline-leaves are rendered as plain <div>s.
      case 'LEAF':
      case 'INLINE_LEAF':
        return (
          <div key={nodeId} className={className}>
            {label}
          </div>
        );

      default:
        throw new Error(`Unrecognized node type ${type}`);
    }
  };

  render() {
    const { rootNode } = this.props;
    return (
      <div className="DOMViewer">
        {typeof rootNode === 'number' ? (
          this.renderDOMNode(rootNode)
        ) : (
          <span className="DOMViewer__loading">No root node selected</span>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  nodes: getNodes(state),
  rootNode: getInspectionRoot(state),
  selectedNodes: getSelectedNodes(state),
  resolveNode: getNodeById(getNodes(state)),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  highlightNode: nodeId => dispatch(highlightNode(nodeId)),
  clearHighlight: () => dispatch(clearHighlight()),
  toggleSelectNode: nodeId => dispatch(toggleSelectNode(nodeId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DOMViewer);
