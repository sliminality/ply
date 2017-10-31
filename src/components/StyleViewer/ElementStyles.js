// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { colors, mixins } from '../../styles';

import type { NodeStyle, InspectorSettings } from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

type Props = {
  nodeId: CRDP$NodeId,
  style: NodeStyle,
  isPruning: boolean,
  pruneNode: CRDP$NodeId => void,
  settings: InspectorSettings,
  children?: Array<React.Node>,
};

type State = {
  activeView: number,
};

class ElementStyles extends React.Component<Props, State> {
  props: Props;
  state: State = {
    activeView: 0,
  };

  switchView = (index: number) => {
    this.setState({
      activeView: index,
    });
  };

  renderToolbar() {
    const { nodeId, pruneNode, isPruning, settings, children } = this.props;
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
            Node ID: {this.props.nodeId}
          </span>
        )}
        <button
          className="uk-button-default uk-button-small"
          onClick={() => pruneNode(nodeId)}
        >
          {isPruning ? 'Pruning...' : 'Prune'}
        </button>
      </div>
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
});

export default ElementStyles;
