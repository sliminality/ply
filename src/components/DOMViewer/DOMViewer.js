// @flow
import React from 'react';
import nodeActions from './Node';
import './DOMViewer.css';

type Props = {
  rootNode: Node,
  toggleSelected: (number) => void,
  isSelected: (number) => void,
};

const DOMViewer = ({ rootNode, toggleSelected, isSelected }: Props) => {
  let rootItem;

  if (rootNode) {
    const Node = nodeActions({ toggleSelected, isSelected });
    rootItem = Node(rootNode);
  } else {
    rootItem = (<span className="DOMViewer__loading">Loading...</span>);
  }

  return (
    <div className="DOMViewer">
      {rootItem}
    </div>
  );
};

export default DOMViewer;
