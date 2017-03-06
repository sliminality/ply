// @flow
import React, { Component } from 'react';
import TreeView from 'react-treeview';
import './treeview.css';

const nodeLabel = node => {
  if (node.nodeValue) {
    return node.nodeValue;
  }

  const results = [];

  if (node.localName !== 'div') {
    const nameSpan = <span className="node__name">{node.localName}</span>;
    results.push(nameSpan);
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
          el = (<span className="node__attr-name">{a}</span>);
          results.push(el);
        }
      } else {
        // If it's a value, check for the last prefix.
        if (nextClassName) {
          let contents = a;
          if (nextClassName === 'class') {
            contents = contents.split(' ').join('.');
          }
          el = (
            <span className={classNames[nextClassName]}>
              {contents}
            </span>
          );
          results.push(el);
          nextClassName = null;
        } else {
          const contents = a.substring(0, 10).concat('...');
          el = (<span className="node__attr-value">{contents}</span>);
          results.push(el);
        }
      }
    }
  }

  return results;
};

const TreeViewNode = node => {
  return (
    <TreeView key={node.nodeId}
              node={node}
              nodeLabel={nodeLabel(node)}
              defaultCollapsed={true}
    >
      {node.children ? node.children.map(TreeViewNode) : ''}
    </TreeView>
  );
};

class DOMViewer extends Component {
  render() {
    const rootItem = this.props.root
      ? TreeViewNode(this.props.root)
      : <span>Loading...</span>;

    return (
      <div className="DOMViewer">
        {rootItem}
      </div>
    );
  }
}

export default DOMViewer;
