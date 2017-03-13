// @flow
import React from 'react';
import SplitPane from 'react-split-pane';
import StyleDetails from './StyleDetails';
import './StyleViewer.css';

const styleDetailsProps = (styles: Styles) =>
  (nodeId: number): StyleDetailsProps => ({
    nodeId,
    styles: styles[nodeId],
  });

type Props = {
  styles: { [nodeId: number]: Object },
  selected: { [nodeId: number]: Node },
};

const StyleDetailTree = (styleDetails: StyleDetails[]) => {
  /**
   * To make all the panes evenly sized, compute
   * the size of the top pane in the current frame
   * as (100% / (TOTAL_NODES - NODES_PROCESSED).
   */
  const numStyles = styleDetails.length;
  const reducer =
    (memo: StyleDetailTree, current: StyleDetails, i: number) => {
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
      const selectedNodeIds = Object.keys(selected);
      const styleDetails: StyleDetails[] =
        selectedNodeIds
          .map(styleDetailsProps(styles))
          .map(p => <StyleDetails {...p} />);
      content = StyleDetailTree(styleDetails);
    }
  }
  return (
    <div className="StyleViewer">
      {content}
    </div>
  );
};

export default StyleViewer;
