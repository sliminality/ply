// @flow @format
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getConnection, getError } from '../selectors';
import SplitPane from 'react-split-pane';
import DOMViewer from '../components/DOMViewer/DOMViewer';
import StyleViewer from '../components/StyleViewer/StyleViewer';
import { StyleSheet, css } from 'aphrodite';
import './Inspector.css';

import type { State as ReduxState, Connection } from '../types';

type Props = {
  connection: Connection,
  error: string,
};

type State = {
  settings: {
    inspectMultiple: boolean,
  },
};

class Inspector extends Component<Props, State> {
  props: Props;
  state: State = {
    settings: {
      inspectMultiple: false,
    },
  };

  renderConnectionStatus() {
    const { connection } = this.props;
    const { targetConnected, connected, reconnecting } = connection;
    let status;
    if (reconnecting) {
      status = 'reconnecting';
    } else {
      if (!connected) {
        // Not reconnecting, not connected.
        status = 'noServer';
      } else {
        if (!targetConnected) {
          // Connected, no target.
          status = 'noTarget';
        } else {
          // Connected && target connected.
          status = 'ok';
        }
      }
    }
    const messages = {
      reconnecting: 'Attempting to reconnect to server...',
      noServer: 'Could not reach server.',
      noTarget: 'Connected to server, but no target attached.',
      ok: 'Connected.',
    };
    return (
      <div className={css(styles.connectionStatus, styles[status])}>
        {messages[status]}
      </div>
    );
  }

  render() {
    // TODO: connection info
    return (
      <div className={`Inspector ${css(styles.wrapper)}`}>
        {this.renderConnectionStatus()}
        <div className={css(styles.splitPaneWrapper)}>
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
      </div>
    );
  }
}

const styleConstants = {
  red: 'hsl(0, 69%, 54%)',
  green: 'hsl(123, 60%, 46%)',
  yellow: 'hsl(65, 96%, 73%)',
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  connectionStatus: {
    textAlign: 'center',
    height: 25,
    padding: 5,
  },
  reconnecting: {
    backgroundColor: styleConstants.yellow,
    color: 'black',
  },
  noServer: { backgroundColor: styleConstants.red, color: 'white' },
  noTarget: { backgroundColor: styleConstants.red, color: 'white' },
  ok: { backgroundColor: styleConstants.green, color: 'white' },
  splitPaneWrapper: {
    position: 'relative',
    flex: 1,
  },
});

const mapStateToProps = (state: ReduxState) => ({
  connection: getConnection(state),
  error: getError(state),
});

export default connect(mapStateToProps)(Inspector);
