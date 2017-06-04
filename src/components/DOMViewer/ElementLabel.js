// @flow
import React from 'react';
import AttributeList from './AttributeList';

/**
 * Types of nodes.
 * - Fork: a node with regular children. May be expanded/collapsed.
 * - Inline Leaf: a node with one child, a Value. Rendered with content inline.
 * - Value: a node with no children and a value, e.g. text.
 */
const nodeType = (node: Node): NodeType => {
  const { children, attributes } = node;

  if (children && children.length > 0) {
    if (children.length > 1) {
      return 'FORK';
    } else {
      // One child; check if it has attributes.
      return children[0].attributes ? 'FORK' : 'INLINE_LEAF';
    }
  } else {
    // No children; check if there are attributes.
    return attributes ? 'INLINE_LEAF' : 'LEAF';
  }
};

/**
 * Label for a node, with event handlers.
 */
const Label = ({ node, requestHighlight, toggleSelected }) => {
  const type: NodeType = nodeType(node);

  if (type === 'LEAF') {
    return <ValueLabel value={node.nodeValue} />;
  } else {
    const labelProps = {
      node,
      toggleSelected: () => toggleSelected(node.nodeId),
      toggleHighlight: ({ type }: Event) => {
        type === 'mouseenter'
          ? requestHighlight(node.nodeId)
          : requestHighlight(null);
      },
    };

    if (type === 'INLINE_LEAF') {
      // If it's an inline leaf with a single text child
      // (e.g. an <h1>) we need to get the child's value.
      const firstChild = node.children && node.children[0];
      if (firstChild) {
        labelProps.value = firstChild.nodeValue;
      }
    }

    return <FullElementLabel {...labelProps} />;
  }
};

/**
 * Simple element label for text nodes.
 */
const ValueLabel = ({ value }) => {
  const maxLength = 40;
  const truncated: string = `${value.substring(0, maxLength)}...`;

  return (
    <span className="Node__value">
      {truncated}
    </span>
  );
};

/**
 * Full element label, including node name, attributes, and inline value.
 */
const FullElementLabel = ({ node, toggleSelected, toggleHighlight, value }) => {
  const labelValue = value
    ? <span className="Node__child-value">
        {value}
      </span>
    : null;

  const labelProps = {
    className: 'Node__label',
    onClick: toggleSelected,
    onMouseEnter: toggleHighlight,
    onMouseLeave: toggleHighlight,
  };

  return (
    <div {...labelProps}>
      <span className="Node__name">
        {node.localName}
      </span>
      <AttributeList attrs={node.attributes} />
      {labelValue}
    </div>
  );
};

export { nodeType, Label };
