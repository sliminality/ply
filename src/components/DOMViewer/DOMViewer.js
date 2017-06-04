// @flow
import React from 'react';
import withActions from './Element';
import './DOMViewer.css';

type Props = {
  rootNode: Node,
  toggleSelected: NodeId => void,
  isSelected: NodeId => boolean,
  requestHighlight: ?NodeId => void,
};

const DOMViewer = ({
  rootNode,
  toggleSelected,
  isSelected,
  requestHighlight,
}: Props) => {
  let rootItem;

  const BoundElement = withActions({
    toggleSelected,
    isSelected,
    requestHighlight,
  });

  if (rootNode) {
    rootItem = BoundElement(rootNode);
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
