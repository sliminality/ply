// @flow @format
/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getConnection, getError } from '../selectors';
import SplitPane from 'react-split-pane';
import DOMViewer from './DOMViewer/DOMViewer';
import StyleViewer from './StyleViewer/StyleViewer';
import { StyleSheet, css } from 'aphrodite';
import { colors } from '../styles';
import '../../lib/css/split-pane.css';

import type {
  State as ReduxState,
  Connection,
  InspectorSettings,
} from '../types';

type Props = {
  connection: Connection,
  error: string,
};

type State = {
  showSettings: boolean,
  settings: InspectorSettings,
};

class Inspector extends Component<Props, State> {
  props: Props;
  state: State = {
    showSettings: false,
    settings: {
      inspectMultiple: false,
      showDevControls: true,
      deepExpandNodes: true,
    },
  };

  toggleShowSettings = () => {
    const { showSettings } = this.state;
    this.setState({ showSettings: !showSettings });
  };

  toggleSetting = (item: string) => {
    const { settings } = this.state;
    this.setState({ settings: { ...settings, [item]: !settings[item] } });
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

  renderSettings() {
    const { showSettings, settings } = this.state;
    return (
      <div className={css(styles.settingsWrapper)}>
        <button
          className="uk-button-default uk-button-small"
          onClick={this.toggleShowSettings}
        >
          Settings
        </button>
        {showSettings && (
          <div className={css(styles.settings)}>
            <ul className={css(styles.settingsList)}>
              {Object.keys(settings).map((item: string, i: number) => (
                <li key={i} className={css(styles.settingsListItem)}>
                  <label className={css(styles.settingsItemLabel)}>
                    <input
                      type="checkbox"
                      className={`uk-checkbox ${css(styles.settingsCheck)}`}
                      checked={settings[item]}
                      onChange={() => this.toggleSetting(item)}
                    />
                    {item.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  renderToolbar() {
    return (
      <div className={css(styles.toolbar)}>
        {this.renderConnectionStatus()}
        {this.renderSettings()}
      </div>
    );
  }

  render() {
    const { settings } = this.state;
    return (
      <div className={`Inspector ${css(styles.wrapper)}`}>
        <div className={css(styles.splitPaneWrapper)}>
          <SplitPane
            split="vertical"
            minSize={250}
            defaultSize="33%"
            primary="second"
          >
            <DOMViewer settings={settings} />
            <StyleViewer settings={settings} />
          </SplitPane>
        </div>
        {this.renderToolbar()}
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

  toolbar: {
    display: 'flex',
  },

  settingsWrapper: {
    position: 'relative',
  },
  settings: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    backgroundColor: 'white',
    width: 200,
    zIndex: 5,
    outline: `1px solid ${colors.lightestGrey}`,
    borderRadius: 8,
    padding: 10,
  },
  settingsList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  },
  settingsListItem: {
    marginBottom: 5,
  },
  settingsItemLabel: {
    cursor: 'pointer',
  },
  settingsCheck: {
    marginRight: 5,
  },

  connectionStatus: {
    textAlign: 'center',
    padding: 5,
    flex: 1,
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
