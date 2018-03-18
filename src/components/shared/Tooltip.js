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
  isLarge?: boolean,
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
    const { children, title, direction, isLarge, rest } = this.props;
    const { showTooltip } = this.state;
    return (
      <span
        className={css(styles.wrapper)}
        onMouseEnter={this.toggleTooltip}
        onMouseLeave={this.toggleTooltip}
      >
        {children}
        {showTooltip && (
          <div
            className={css(
              styles.tooltip,
              isLarge && styles.tooltipLarge,
              styles[direction],
            )}
            {...rest}
          >
            {title}
          </div>
        )}
      </span>
    );
  }
}

Tooltip.defaultProps = {
  direction: 'right',
  large: false,
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
  },
  tooltipLarge: {
    padding: '5px 10px',
    minWidth: 150,
    maxWidth: 300,
  },
  right: {
    top: 0,
    right: 0,
    transform: 'translateX(calc(100% + 5px))',
  },
  left: {
    top: 0,
    left: 0,
    transform: 'translateX(calc(-100% - 5px))',
  },
  bottom: {
    left: '50%',
    transform: 'translateX(-50%)',
  },
});

export default Tooltip;
