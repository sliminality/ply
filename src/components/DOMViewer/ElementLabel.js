// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import AttributeList from './AttributeList';
import { StyleSheet, css } from 'aphrodite';
import { colors } from '../../styles';

import type { NormalizedNode } from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

export type NodeDisplayType = 'FORK' | 'LEAF' | 'INLINE_LEAF';

/**
 * Labels for DOMViewer nodes.
 */

// DOM node types, as defined by:
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  '1': 'ELEMENT_NODE',
  '3': 'TEXT_NODE',
  '7': 'PROCESSING_INSTRUCTION_NODE',
  '8': 'COMMENT_NODE',
  '9': 'DOCUMENT_NODE',
  '10': 'DOCUMENT_TYPE_NODE',
  '11': 'DOCUMENT_FRAGMENT_NODE',
};

// Number of characters to show for a value before truncating.
function getMaxLengthForNode(node: NormalizedNode): number {
  const { nodeName } = node;
  const maxValueLengths = {
    default: 40,
    style: 50,
    noscript: 50,
    script: 50,
    p: 100,
  };
  return maxValueLengths[nodeName] || maxValueLengths.default;
}

type LabelProps = {
  node: NormalizedNode,
  nodeDisplayType: NodeDisplayType,
  firstChild: ?NormalizedNode,
  highlightNode: CRDP$NodeId => void,
  toggleSelectNode: CRDP$NodeId => void,
  clearHighlight: () => void,
};

const Label = ({
  node,
  nodeDisplayType,
  firstChild,
  highlightNode,
  clearHighlight,
  toggleSelectNode,
}: LabelProps) => {
  const { nodeValue, nodeId } = node;
  switch (nodeDisplayType) {
    case 'LEAF':
      return (
        <ValueLabel value={nodeValue} maxLength={getMaxLengthForNode(node)} />
      );

    case 'FORK':
      return (
        <FullElementLabel
          node={node}
          toggleSelectNode={() => toggleSelectNode(nodeId)}
          highlightNode={() => highlightNode(nodeId)}
          clearHighlight={clearHighlight}
        />
      );

    case 'INLINE_LEAF':
      // If it's an inline leaf with a single text child
      // (e.g. an <h1>) we need to get the child's value.
      const firstChildValue = firstChild && firstChild.nodeValue;
      const value =
        typeof firstChildValue === 'string' ? { value: firstChildValue } : null;
      return (
        <FullElementLabel
          node={node}
          toggleSelectNode={() => toggleSelectNode(nodeId)}
          highlightNode={() => highlightNode(nodeId)}
          clearHighlight={clearHighlight}
          {...value}
        />
      );

    default:
      throw new Error(`Unrecognized node type ${nodeDisplayType}`);
  }
};

/**
 * Simple element label for text nodes.
 */
type ValueLabelProps = {
  value: string,
  maxLength?: number,
};

type ValueLabelState = {
  showTruncated: boolean,
};

class ValueLabel extends React.Component<ValueLabelProps, ValueLabelState> {
  props: ValueLabelProps;
  state: ValueLabelState = {
    showTruncated: true,
  };

  toggleShowTruncated = () => {
    const { showTruncated } = this.state;
    this.setState({ showTruncated: !showTruncated });
  };

  render() {
    const { value, maxLength } = this.props;
    const { showTruncated } = this.state;
    const needsTruncation =
      typeof maxLength === 'number' && value.length > maxLength;
    return (
      <span>
        <span
          className={css(styles.nodeValue)}
          onClick={this.toggleShowTruncated}
          title={
            needsTruncation && !showTruncated
              ? 'Click to expand/collapse contents'
              : null
          }
        >
          {showTruncated && needsTruncation
            ? value.substring(0, maxLength)
            : value}
        </span>
        {needsTruncation && (
          <button
            className={css(styles.ellipsis)}
            onClick={this.toggleShowTruncated}
            title="Expand/collapse contents"
          >
            ...
          </button>
        )}
      </span>
    );
  }
}

/**
 * Full element label, including node name, attributes, and inline value.
 */
const FullElementLabel = ({
  node,
  toggleSelectNode,
  highlightNode,
  clearHighlight,
  value,
}: {
  node: NormalizedNode,
  toggleSelectNode: () => void,
  highlightNode: () => void,
  clearHighlight: () => void,
  value?: string,
}) => (
  <div
    className="Node__label"
    onClick={toggleSelectNode}
    onMouseEnter={highlightNode}
    onMouseLeave={clearHighlight}
  >
    <span className="Node__name">{node.localName}</span>
    <AttributeList attrs={node.attributes} />
    {/* Add a space between the end of the node and the value. */}{' '}
    {value && (
      <ValueLabel value={value} maxLength={getMaxLengthForNode(node)} />
    )}
  </div>
);

const styles = StyleSheet.create({
  nodeValue: {
    color: colors.grey,
  },
  ellipsis: {
    marginLeft: '0.5em',
    padding: '2px 4px',
    backgroundColor: colors.lightestGrey,
    border: `1px solid ${colors.lightGrey}`,
    borderRadius: 2,

    ':hover': {
      backgroundColor: colors.lightGrey,
    },
  },
});

export default Label;
