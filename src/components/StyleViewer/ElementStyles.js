// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { colors, mixins } from '../../styles';
import Icon from '../shared/Icon';

import type { NodeStyle, InspectorSettings, NodeStyleMask } from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

type Props = {
  nodeId: CRDP$NodeId,
  style: NodeStyle,
  isPruning: boolean,
  pruneNode: CRDP$NodeId => void,
  settings: InspectorSettings,
  children?: Array<React.Node>,
  mask?: NodeStyleMask,
};

type State = {
  activeView: number,
  showPruneMenu: boolean,
};

class ElementStyles extends React.Component<Props, State> {
  props: Props;
  state: State = {
    activeView: 0,
    showPruneMenu: false,
  };

  switchView = (index: number) => {
    this.setState({
      activeView: index,
    });
  };

  togglePruneMenu = (show?: boolean) => {
    const { showPruneMenu } = this.state;
    if (typeof show === 'boolean') {
      this.setState({ showPruneMenu: show });
    } else {
      this.setState({ showPruneMenu: !showPruneMenu });
    }
  };

  renderToolbar() {
    const { settings, children } = this.props;
    const { activeView } = this.state;
    const { showDevControls } = settings;
    const tabs = React.Children.map(children, (child, i) => (
      <li
        key={i}
        className={css(styles.tab, activeView === i && styles.tabActive)}
        onClick={() => this.switchView(i)}
      >
        {child && child.props.name}
      </li>
    ));
    return (
      <div className={css(styles.toolbar)}>
        <ul className={css(styles.tabs)}>{tabs}</ul>
        {showDevControls && (
          <span className="ElementStyles__node-id">
            ID: {this.props.nodeId}
          </span>
        )}
        {this.renderPruneButton()}
      </div>
    );
  }

  renderPruneButton() {
    const { nodeId, pruneNode, isPruning, mask } = this.props;
    const { showPruneMenu } = this.state;

    // TODO: Logic about whether or not properties have
    // been changed since "Prune."

    if (mask) {
      return (
        <div className="uk-button-group">
          <button className="uk-button uk-button-default uk-button-small">
            Prune
          </button>
          <button
            className={`${css(
              styles.pruneMenuButton,
            )} uk-button uk-button-default uk-button-small`}
            type="button"
            tabIndex={0}
            onClick={this.togglePruneMenu}
            onBlur={() => this.togglePruneMenu(false)}
          >
            <Icon type="triangle-down" />
          </button>
          {showPruneMenu && (
            <div className={css(styles.dropdown)}>
              <ul className="uk-nav uk-dropdown-nav">
                <li>
                  <a href="#">Reset to pruned</a>
                </li>
                <li>
                  <a href="#">Check dependencies</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        className="uk-button-default uk-button-small"
        onClick={() => pruneNode(nodeId)}
      >
        {isPruning ? 'Pruning...' : 'Prune'}
      </button>
    );
  }

  render() {
    const { style, nodeId, children } = this.props;
    const { activeView } = this.state;
    return (
      <div className="ElementStyles" key={nodeId}>
        {this.renderToolbar()}
        <div className="ElementStyles__content">
          {!style && (
            <span className="ElementStyles__loading">Loading styles...;</span>
          )}
          {children && children[activeView]}
        </div>
      </div>
    );
  }
}

const styles = StyleSheet.create({
  toolbar: {
    ...mixins.smallCaps,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    borderBottom: `1px solid ${colors.lightestGrey}`,
  },
  tabs: {
    alignSelf: 'flex-end',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexWrap: 'wrap',
    // This looks weird with the rest of the header.
    // borderBottom: `1px solid ${colors.lightestGrey}`,
  },
  tab: {
    margin: 0, // Reset
    marginTop: 2,
    padding: '5px 10px',
    color: colors.lightGrey,

    // For the underline
    position: 'relative',
    cursor: 'pointer',

    ':hover': {
      color: colors.medGrey,
      transition: 'color .1s ease-in-out',
    },
  },
  tabActive: {
    color: 'black',
    '::after': {
      content: '""',
      width: '100%',
      height: 2,
      backgroundColor: colors.uiBlue,
      position: 'absolute',
      left: 0,
      bottom: 0,
      transform: 'translateY(1px)',
    },
  },
  dropdown: {
    position: 'absolute',
    boxShadow: '0 5px 12px rgba(0,0,0,0.15)',
    zIndex: 3000,
    background: 'white',
    right: 0,
    top: '100%',
    minWidth: 200,
    padding: 10,
  },
  pruneMenuButton: {
    marginLeft: -1,
    padding: '0 5px',
  },
});

export default ElementStyles;
