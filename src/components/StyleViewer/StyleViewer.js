// @flow
import React from 'react';
import SplitPane from 'react-split-pane';
import StyleDetails from './StyleDetails';
import './StyleViewer.css';

const styleDetailsProps = (styles: { [NodeId]: NodeStyles }) =>
  (nodeId: NodeId) => ({
    nodeId,
    styles: styles[nodeId],
  });

type Props = {
  styles: { [NodeId]: NodeStyles },
  selected: { [NodeId]: Node },
};

/**
 * Reduce an array of <StyleDetails /> components into a
 * tree of <SplitPane /> components.
 */
const StyleDetailTree = (styleDetails) => {
  /**
   * To make all the panes evenly sized, compute
   * the size of the top pane in the current frame
   * as (100% / (TOTAL_NODES - NODES_PROCESSED).
   */
  const numStyles = styleDetails.length;
  const reducer = (memo: SplitPane, current: StyleDetails, i: number) => {
    const props = {
      split: 'horizontal',
      minSize: 50,
      defaultSize: `${100 / (numStyles - i)}%`,
    };
    return (
      <SplitPane {...props}>
        {current}
        {memo}
      </SplitPane>
    );
  };
  return styleDetails.reduceRight(reducer);
};

const StyleViewer = (props: Props) => {
  const { selected, styles } = props;
  let content;
  const noneSelected = Object.keys(selected).length === 0;
  if (noneSelected) {
    content = (
      <span className="StyleViewer__none-selected">
        No styles selected.
      </span>
    );
  } else {
    // Construct a nested series of SplitPanes,
    // in the order elements were selected.
    if (styles) {
      const selectedNodeIds = Object.keys(selected).map(s => parseInt(s, 10));
      const styleDetails = selectedNodeIds
        .map(styleDetailsProps(styles))
        .map(props => <StyleDetails {...props} />);
      content = StyleDetailTree(styleDetails);
    } else {
      // There are selected nodes, but no styles yet.
      // Tell it like it is.
      content = 'No styles loaded yet';
    }
  }
  return (
    <div className="StyleViewer">
      {content}
    </div>
  );
};

export default StyleViewer;
