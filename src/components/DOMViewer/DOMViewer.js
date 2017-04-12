// @flow
import React from 'react';
import Element from './Element';
import './DOMViewer.css';

type Props = {
  rootNode: Element,
  toggleSelected: (number) => void,
  isSelected: (number) => void,
};

const DOMViewer = ({ rootNode, toggleSelected, isSelected }: Props) => {
  let rootItem;

  if (rootNode) {
    rootItem = Element({ toggleSelected, isSelected })(rootNode);
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
