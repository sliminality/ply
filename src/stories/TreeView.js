import React, { Component } from 'react';
import TreeNode from './TreeNode';

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
};

class TreeView extends Component {
  constructor(props) {
    super(props);
    this.onToggleExpand = this.onToggleExpand.bind(this);

    this.state = {
      roots: this.props.roots,
    };
  }

  onToggleExpand(root, id) {
    const { roots } = this.state;
    const treeRoot = this.state.roots
      .find(rt => rt.startIndex === root);

    const q = [treeRoot];

    while (q.length > 0) {
      const current = q.pop();
      if (current.startIndex === id) {
        return current;
      }

      const { children } = current;
      if (children && children.length > 0) {
        children.forEach(child =>
          q.push(child));
      }
    }

    return null;

    if (node) {
      // toggle Expand it
    }

    console.log(root, id);
  }

  render() {
    const rootNodes = this.state.roots.map(rt => {
      return (
        <TreeNode key={rt.startIndex}
                  treeRoot={rt.startIndex}
                  node={rt}
                  isExpanded={true}
                  depth={0}
                  onToggleExpand={this.onToggleExpand}
        />
      );
    });

    return (
      <ul className="uk-list">
        {rootNodes}
      </ul>
    );
  }
}

export default TreeView;
