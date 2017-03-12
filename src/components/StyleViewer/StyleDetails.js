// @flow
import React from 'react';

type Props = {
  nodeId: number,
  styles: Object,
};

const StyleDetails = (props: Props) => {
  return (
    <span>{props.nodeId}</span>
  );
};

export default StyleDetails;
