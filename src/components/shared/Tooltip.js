// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { mixins, colors } from '../../styles';

type Props = {
  children: React.Node,
  title: React.Node,
};

type State = {
  showTooltip: boolean,
};

class Tooltip extends React.Component<Props, State> {
  props: Props;
  state: State = {
    showTooltip: false,
  };

  toggleTooltip = () => {
    const { showTooltip } = this.state;
    this.setState({ showTooltip: !showTooltip });
  };

  render() {
    const { children, title } = this.props;
    const { showTooltip } = this.state;
    return (
      <span
        className={css(styles.wrapper)}
        onMouseEnter={this.toggleTooltip}
        onMouseLeave={this.toggleTooltip}
      >
        {children}
        {showTooltip && <span className={css(styles.tooltip)}>{title}</span>}
      </span>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  tooltip: {
    ...mixins.sansSerif,
    color: 'white',
    backgroundColor: colors.darkGrey,
    fontSize: 12,
    position: 'absolute',
    borderRadius: 2,
    padding: '3px 6px',
    right: '100%',
    marginRight: 5,
  },
});

export default Tooltip;
