// @flow
import React, { Component } from 'react';
import { deleteIn } from '../../utils/state';
import TreeView from 'react-treeview';
import './treeview.css';

const nodeLabel = node => {
  if (node.nodeValue) {
    return node.nodeValue;
  }

  const results = [];
  let j = 0;

  if (node.localName !== 'div') {
    const nameSpan = <span key={j} className="node__name">{node.localName}</span>;
    results.push(nameSpan);
    j += 1;
  }

  if (node.attributes) {
    const classNames = {
      class: 'node__class',
      id: 'node__id',
    };
    let nextClassName = null;

    for (let i = 0; i < node.attributes.length; i += 1) {
      // Even numbered indices contain attribute names,
      // odd indices contain the value for the previous index.
      const a = node.attributes[i];
      let el;

      if (i % 2 === 0) {
        if (a in classNames) {
          nextClassName = a;
        } else {
          el = (<span key={j} className="node__attr-name">{a}</span>);
          results.push(el);
          j += 1;
        }
      } else {
        // If it's a value, check for the last prefix.
        if (nextClassName) {
          let contents = a;
          if (nextClassName === 'class') {
            contents = contents.split(' ').join('.');
          }
          el = (
            <span key={j} className={classNames[nextClassName]}>
              {contents}
            </span>
          );
          results.push(el);
          j += 1;
          nextClassName = null;
        } else {
          const contents = a.substring(0, 10).concat('...');
          el = (<span key={j} className="node__attr-value">{contents}</span>);
          j += 1;
          results.push(el);
        }
      }
    }
  }

  return results;
};

const TreeViewNode = (props) => {
  const { node, onClick, isSelected } = props;
  const { nodeId } = node;
  const selected = isSelected(nodeId) ? 'node--selected' : '';
  return (
    <TreeView key={nodeId}
              nodeLabel={nodeLabel(node)}
              defaultCollapsed={true}
              onClick={() => onClick(nodeId)}
              itemClassName={`${selected} node`}
    >
      {node.children
        ? node.children.map(child =>
            TreeViewNode({ node: child, onClick, isSelected }))
        : ''}
    </TreeView>
  );
};

class DOMViewer extends Component {
  constructor(props) {
    super(props);
    this.selectNode = this.selectNode.bind(this);
    this.isSelected = this.isSelected.bind(this);

    this.state = {
      selected: {},
    };
  }

  isSelected(nodeId) {
    return nodeId in this.state.selected;
  }

  selectNode(nodeId) {
    const oldSelected = this.state.selected;
    let selected;
    if (nodeId in oldSelected) {
      selected = deleteIn(oldSelected, nodeId);
    } else {
      selected = Object.assign({}, oldSelected, { [nodeId]: true });
    }
    this.props.requestStyles(nodeId);
    this.setState({ selected });
  }

  render() {
    const rootItem = this.props.root
      ? <TreeViewNode node={this.props.root}
                      onClick={this.selectNode}
                      isSelected={this.isSelected}
        />
      : <span>Loading...</span>;

    return (
      <div className="DOMViewer">
        {rootItem}
      </div>
    );
  }
}

export default DOMViewer;
