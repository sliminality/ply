// @flow
import React from 'react';
import TreeView from 'react-treeview';
import { Label, nodeType } from './ElementLabel';

type ElementActions = {
  toggleSelected: NodeId => void,
  isSelected: NodeId => boolean,
  requestHighlight: ?NodeId => void,
};

/**
 * Generate the class name string for styling TreeView items.
 */
const getElementClassName = ({ node, isSelected }) => {
  const type = nodeType(node);
  const nodeClass = {
    FORK: 'Node',
    INLINE_LEAF: 'Node Node--leaf',
    LEAF: 'Node Node--leaf',
  }[type];

  const selectedClass = isSelected ? 'Node--selected' : null;
  const className = [nodeClass, selectedClass].join(' ');
  return className;
};

/**
 * Higher-order pure recursive component (I hate myself too)
 * for rendering the DOMViewer tree.
 *
 * Basically, `actions` is a collection of functions passed
 * down from the DOMViewer parent.
 *
 * In order to avoid passing `actions` down, we close over the
 * argument and return a new function called `BoundElement`,
 * a pure component.
 *
 * `BoundElement` is named (as opposed to anonymous)
 * because it recursively maps over the children of each node.
 */
const withActions = (actions: ElementActions) => {
  const BoundElement = (node: Node) => {
    const { nodeId } = node;
    const className: string = getElementClassName({
      node,
      isSelected: actions.isSelected(node.nodeId),
    });
    const labelProps = {
      node,
      ...actions,
    };
    const label = <Label {...labelProps} />;
    const type: NodeType = nodeType(node);
    const isTreeView: boolean = type === 'FORK';

    if (isTreeView) {
      // Render children recursively.
      const { children } = node;
      const treeViewProps = {
        key: node.nodeId,
        nodeLabel: label,
        itemClassName: className,
        defaultCollapsed: true,
      };
      return (
        <TreeView {...treeViewProps}>
          {children ? children.map(BoundElement) : null}
        </TreeView>
      );
    } else {
      // Leaf or inline leaf.
      // Props shared between leaf and fork nodes.
      const elementProps = {
        key: nodeId, // for React
        className,
      };
      return (
        <div {...elementProps}>
          {label}
        </div>
      );
    }
  };

  return BoundElement;
};

export default withActions;
