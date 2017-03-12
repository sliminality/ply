// @flow
import React from 'react';
import SplitPane from 'react-split-pane';
import Codeblock from 'react-uikit-codeblock';
import StyleDetails from './StyleDetails';
import './StyleViewer.css';

type StyleDetailTree = SplitPane | StyleDetails;

const StyleDetailTree = (styleDetails: StyleDetails[]): StyleDetailTree => {
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

type Props = {
  styles: { [nodeId: number]: Object },
  selected: Set<number>,
};

const StyleViewer = (props: Props) => {
  const { styles, selected } = props;
  let content;
  if (selected.size === 0) {
    content = (
      <span className="StyleViewer__none-selected">
        No styles selected.
      </span>
    );
  } else {
    // Construct a nested series of SplitPanes,
    // in the order elements were selected.
    const styleDetails: StyleDetails[] = [];
    for (const nodeId of selected) {
      const props = {
        nodeId,
        styles: styles[nodeId],
      };
      const details = (<StyleDetails {...props} />);
      styleDetails.push(details);
    }
    content = StyleDetailTree(styleDetails);
  }
  return (
    <div className="StyleViewer">
      {content}
    </div>
  );
};

export default StyleViewer;
