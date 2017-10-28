// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getConnection } from '../selectors';

import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import './Inspector.css';

import type { State as ReduxState, Connection } from '../types';

type Props = {
  connection: Connection,
};

type State = {
  settings: {
    inspectMultiple: boolean,
  },
};

class Inspector extends Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      settings: {
        inspectMultiple: false,
      },
    };
  }

  // toggleSelected = (nodeId: NodeId): void => {
  //   const { selected, settings } = this.state;
  //   let nextState;

  //   if (this.isSelected(nodeId)) {
  //     nextState = {
  //       selected: omit({ ...selected }, [nodeId]),
  //     };
  //   } else {
  //     let node: Node;

  //     if (nodeId === this.props.rootNode.nodeId) {
  //       node = this.props.rootNode;
  //     } else {
  //       node = this.resolveNode(nodeId);
  //     }

  //     nextState = {
  //       selected: {
  //         ...(settings.inspectMultiple ? selected : null),
  //         [nodeId]: node,
  //       },
  //     };

  //     // Fetch styles for selected node if needed.
  //     if (!this.props.styles[nodeId]) {
  //       this.props.requestStyles(nodeId);
  //     }
  //   }

  //   this.setState(nextState);
  // };

  // isSelected = (nodeId: NodeId): boolean => {
  //   return !!this.state.selected[nodeId];
  // };

  render() {
    // TODO: connection info
    return (
      <div className="Inspector">
        <SplitPane
          split="vertical"
          minSize={250}
          defaultSize="33%"
          primary="second"
        >
          <DOMViewer />
          <StyleViewer />
        </SplitPane>
      </div>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  connection: getConnection(state),
});

export default connect(mapStateToProps)(Inspector);
