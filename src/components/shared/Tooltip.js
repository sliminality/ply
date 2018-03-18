// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { zIndex, mixins, colors } from '../../styles';

type TooltipDirection = 'right' | 'left';

type Props = {
  children: React.Node,
  title: React.Node,
  direction?: TooltipDirection,
  rest?: Object,
};

type State = {
  showTooltip: boolean,
};

class Tooltip extends React.Component<Props, State> {
  props: Props;
  state: State = {
    showTooltip: false,
  };
  static defaultProps: Object;

  toggleTooltip = () => {
    const { showTooltip } = this.state;
    this.setState({ showTooltip: !showTooltip });
  };

  render() {
    const { children, title, direction, rest } = this.props;
    const { showTooltip } = this.state;
    return (
      <span
        className={css(styles.wrapper)}
        onMouseEnter={this.toggleTooltip}
        onMouseLeave={this.toggleTooltip}
      >
        {children}
        {showTooltip && (
          <span className={css(styles.tooltip, styles[direction])} {...rest}>
            {title}
          </span>
        )}
      </span>
    );
  }
}

Tooltip.defaultProps = {
  direction: 'left',
};

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
    zIndex: zIndex.tooltip,
    maxWidth: 150,
  },
  left: {
    right: 0,
    transform: 'translateX(calc(100% + 5px))',
  },
  right: {
    left: 0,
    transform: 'translateX(calc(-100% - 5px))',
  },
});

export default Tooltip;
