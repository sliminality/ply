// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { mixins, colors } from '../../styles';

const glyphs = {
  'triangle-down': <polygon points="5 7 15 7 10 12" />,
  social: (
    <React.Fragment>
      <line fill="none" x1="13.4" y1="14" x2="6.3" y2="10.7" />
      <line fill="none" x1="13.5" y1="5.5" x2="6.5" y2="8.8" />
      <circle fill="none" strokeWidth="1.1" cx="15.5" cy="4.6" r="2.3" />
      <circle fill="none" strokeWidth="1.1" cx="15.5" cy="14.8" r="2.3" />
      <circle fill="none" strokeWidth="1.1" cx="4.5" cy="9.8" r="2.3" />
    </React.Fragment>
  ),
};

type IconType = $Keys<typeof glyphs>;

type Props = {
  type: IconType,
  title?: string,
  className?: string,
};

const Icon = ({ className, type, title, ...rest }: Props) => (
  <span className={`${css(styles.icon)} ${className || ''}`} aria-label={title}>
    {/**
      * HACK: this is terrible for a11y but we don't want to have the label
      * appear when the user copy/pastes styles, so we may not render it.
      */
    title && <span className={css(styles.a11yHidden)}>{title}</span>}
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      ratio="1"
      stroke="currentColor"
      fill="currentColor"
      role="img"
      aria-hidden="true"
      {...rest}
    >
      {glyphs[type]}
    </svg>
  </span>
);

const styles = StyleSheet.create({
  a11yHidden: mixins.a11yHidden,
  icon: {
    ':hover': {
      color: colors.medGrey,
    },
  },
});

export default Icon;
