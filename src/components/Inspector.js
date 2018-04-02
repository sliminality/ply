// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { connect } from 'react-redux';
import { getConnection, getError } from '../selectors';
import SplitPane from 'react-split-pane';
import DOMViewer from './DOMViewer/DOMViewer';
import StyleViewer from './StyleViewer/StyleViewer';
import { StyleSheet, css } from 'aphrodite';
import { mixins, colors } from '../styles';
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

class Inspector extends React.Component<Props, State> {
  props: Props;
  state: State = {
    showSettings: false,
    settings: {
      dom: {
        deepExpandNodes: true,
        hideComments: true,
      },
      css: {
        inspectMultiple: false,
        showDevControls: true,
        hidePruned: false,
        showAnnotations: true,
      },
      general: {
        showConnection: false,
      },
    },
  };

  toggleShowSettings = () => {
    const { showSettings } = this.state;
    this.setState({ showSettings: !showSettings });
  };

  toggleSetting = (category: string, item: string) => {
    const { settings } = this.state;
    const catSettings = settings[category];
    this.setState({
      settings: {
        ...settings,
        [category]: {
          ...catSettings,
          [item]: !catSettings[item],
        },
      },
    });
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
          className={'uk-button uk-button-default uk-button-small '.concat(
            css(styles.settingsButton),
          )}
          onClick={this.toggleShowSettings}
        >
          Settings
        </button>
        {showSettings && (
          <div className={css(styles.settings)}>
            {Object.keys(settings).map((category, catIdx) => {
              const items = settings[category];
              return (
                <React.Fragment key={catIdx}>
                  <h5 className="uk-nav-header uk-margin-remove">{category}</h5>
                  <ul className={css(styles.settingsList)}>
                    {Object.keys(items).map((item: string, itemIdx: number) => (
                      <li
                        key={itemIdx}
                        className={css(styles.settingsListItem)}
                      >
                        <label className={css(styles.settingsItemLabel)}>
                          <input
                            type="checkbox"
                            className={`uk-checkbox ${css(
                              styles.settingsCheck,
                            )}`}
                            checked={items[item]}
                            onChange={() => this.toggleSetting(category, item)}
                          />
                          {item.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  renderToolbar() {
    const { settings } = this.state;
    const { showConnection } = settings.general;
    return (
      <div className={css(styles.toolbar)}>
        {showConnection && this.renderConnectionStatus()}
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
            <DOMViewer settings={settings.dom} />
            <StyleViewer settings={settings.css} />
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

  settingsButton: {
    backgroundColor: 'white',
  },
  settingsWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  settings: {
    ...mixins.dropdown,
    bottom: '100%',
    right: 0,
    width: 200,
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
