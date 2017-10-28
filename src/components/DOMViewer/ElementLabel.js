// @flow
import React from 'react';
import AttributeList from './AttributeList';
import type { NormalizedNode } from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

export type DOMViewerNodeType = 'FORK' | 'LEAF' | 'INLINE_LEAF';

/**
 * Label for a node, with event handlers.
 */

type LabelProps = {
  node: NormalizedNode,
  nodeType: DOMViewerNodeType,
  firstChild: ?NormalizedNode,
  highlightNode: CRDP$NodeId => void,
  toggleSelectNode: CRDP$NodeId => void,
  clearHighlight: () => void,
};

const Label = ({
  node,
  nodeType,
  firstChild,
  highlightNode,
  clearHighlight,
  toggleSelectNode,
}: LabelProps) => {
  const { nodeValue, nodeId } = node;
  switch (nodeType) {
    case 'LEAF':
      return <ValueLabel value={nodeValue} />;

    case 'FORK':
    case 'INLINE_LEAF':
      // If it's an inline leaf with a single text child
      // (e.g. an <h1>) we need to get the child's value.
      const firstChildValue = firstChild && firstChild.nodeValue;
      return (
        <FullElementLabel
          node={node}
          toggleSelectNode={() => toggleSelectNode(nodeId)}
          highlightNode={() => highlightNode(nodeId)}
          clearHighlight={clearHighlight}
          value={typeof firstChildValue === 'string' && firstChildValue}
        />
      );

    default:
      throw new Error(`Unrecognized node type ${nodeType}`);
  }
};

/**
 * Simple element label for text nodes.
 */
const ValueLabel = ({
  value,
  maxLength = 40,
}: {
  value: string,
  maxLength?: number,
}) => (
  <span className="Node__value">{`${value.substring(0, maxLength)}...`}</span>
);

/**
 * Full element label, including node name, attributes, and inline value.
 */
const FullElementLabel = ({
  node,
  toggleSelectNode,
  highlightNode,
  clearHighlight,
  value,
}) => (
  <div
    className="Node__label"
    onClick={toggleSelectNode}
    onMouseEnter={highlightNode}
    onMouseLeave={clearHighlight}
  >
    <span className="Node__name">{node.localName}</span>
    <AttributeList attrs={node.attributes} />
    {value && <span className="Node__child-value">{value}</span>}
  </div>
);
export default Label;
