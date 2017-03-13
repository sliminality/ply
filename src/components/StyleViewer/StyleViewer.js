// @flow
import React from 'react';
import StyleDetailTree from './StyleDetailTree';
import StyleDetails, { StyleDetailsProps } from './StyleDetails';
import './StyleViewer.css';

type Props = {
  styles: { [nodeId: number]: Object },
  selected: { [nodeId: number]: Node },
};

const styleDetailsProps = ({ styles, selected }: Props) =>
  (nodeId: number): StyleDetailsProps => {
    let parentComputedStyle = null;
    const { parentId } = selected[nodeId];
    if (parentId) {
      parentComputedStyle = styles[parentId].computedStyle;
    }
    return {
      key: nodeId,
      parentComputedStyle,
      styles: styles[nodeId],
    };
  };

const StyleViewer = (props: Props) => {
  const { selected } = props;
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
    const selectedNodeIds = Object.keys(selected);
    const styleDetails: StyleDetails[] =
      selectedNodeIds
        .map(styleDetailsProps(props))
        .map(p => <StyleDetails {...p} />);
    content = StyleDetailTree(styleDetails);
  }
  return (
    <div className="StyleViewer">
      {content}
    </div>
  );
};

export default StyleViewer;
