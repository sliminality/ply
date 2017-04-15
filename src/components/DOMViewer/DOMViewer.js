// @flow
import React from 'react';
import Element from './Element';
import './DOMViewer.css';

type Props = {
  rootNode: Node,
  toggleSelected: (NodeId) => void,
  isSelected: (NodeId) => boolean,
};

const DOMViewer = ({ rootNode, toggleSelected, isSelected }: Props) => {
  let rootItem;

  if (rootNode) {
    rootItem = Element({ toggleSelected, isSelected })(rootNode);
  } else {
    rootItem = <span className="DOMViewer__loading">Loading...</span>;
  }

  return (
    <div className="DOMViewer">
      {rootItem}
    </div>
  );
};

export default DOMViewer;
