// @flow
import React, { Component } from 'react';

type BaseElement = {
  parent: ?Element,
  next: ?Element,
  prev: ?Element,
  startIndex: number,
  type: 'text' | 'tag',
};

type TextElement = {
  data: string,
} & BaseElement;

type TagElement = {
  attribs: { [attrib: string]: string },
  children: Element[],
  name: string,
} & BaseElement;

type Element = TagElement | TextElement;

const styles = {
  main: {
    border: '1px solid #eee',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 15,
    padding: '3px 10px',
    margin: 10,
  },
  tagAttr: {
    marginRight: 5,
  },
  tagName: {
    marginRight: 5,
  },
  arrowCollapsed: {
    borderColor: 'transparent transparent transparent rgb(110, 110, 110)',
    borderStyle: 'solid',
    borderWidth: '4px 0 4px 7px',
    display: 'inline-block',
    marginLeft: 1,
    verticalAlign: 'top',
    marginRight: 5,
  },
  arrowExpanded: {
    borderColor: '#555 transparent transparent transparent',
    borderStyle: 'solid',
    borderWidth: '7px 4px 0 4px',
    display: 'inline-block',
    marginTop: 1,
    verticalAlign: 'top',
    marginRight: 5,
  },
};

const attrToSpan = ([attr, val]) => {
  let prefix;

  if (val === '') {
    prefix = attr;
  } else {
    const prefixMap = {
      class: '.',
      id: '#',
      default: `${attr}=`,
    };

    prefix = prefixMap[attr] || prefixMap['default'];
  }

  return (
    <span key={attr} style={styles.tagAttr}>
      {prefix}
      {val}
    </span>
  );
};

const TagNode = (props) => {
  const { isExpanded, node } = props;
  const { children } = node;

  const hasChildren = children.length > 0;
  let childNodes;

  if (isExpanded && hasChildren) {
    childNodes = children.map(child => {
      // Avoid displaying empty text nodes.
      if (child.type === 'text' && child.data.trim() === '') {
        return null;
      }

      return (
        <TreeNode key={child.startIndex}
                  node={child}
                  depth={props.depth + 1}
                  isExpanded={false}
                  onToggleExpand={props.onToggleExpand}
        />
      );
    });
  }

  const arrowStyle = isExpanded
    ? styles.arrowExpanded
    : styles.arrowCollapsed;

  const attrList = Object.entries(node.attribs)
    .map(attrToSpan);

  return (
    <li>
      <span style={arrowStyle}
            onClick={props.onToggleExpand}
      />
      <span style={styles.tagName}>{node.name}</span>
      {attrList}
      <ul>{childNodes}</ul>
    </li>
  );
};

class TreeNode extends Component {
  props: {
    node: Element,
    depth: number,
    isExpanded: boolean,
    onToggleExpand: () => void,
  };

  render() {
    const { type } = this.props.node;
    let contents;

    if (type === 'text') {
      const text = this.props.node.data.trim();

      contents =
        <span>"{text}"</span>;
    } else if (type === 'tag') {
      contents = TagNode(this.props);
    } else {
      console.error('TreeNode: Unrecognized node type', type);
    }

    const leftPad = {
      paddingLeft: (this.props.depth) * 10,
    };

    const treeNodeStyles = {
      ...styles.main,
      ...leftPad,
    };

    return (
      <li style={treeNodeStyles}>
        {contents}
      </li>
    );
  }
}

export default TreeNode;
