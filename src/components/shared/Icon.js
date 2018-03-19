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
  info: (
    <React.Fragment>
      <path d="M12.13,11.59 C11.97,12.84 10.35,14.12 9.1,14.16 C6.17,14.2 9.89,9.46 8.74,8.37 C9.3,8.16 10.62,7.83 10.62,8.81 C10.62,9.63 10.12,10.55 9.88,11.32 C8.66,15.16 12.13,11.15 12.14,11.18 C12.16,11.21 12.16,11.35 12.13,11.59 C12.08,11.95 12.16,11.35 12.13,11.59 L12.13,11.59 Z M11.56,5.67 C11.56,6.67 9.36,7.15 9.36,6.03 C9.36,5 11.56,4.54 11.56,5.67 L11.56,5.67 Z" />
      <circle fill="none" strokeWidth="1.1" cx="10" cy="10" r="9" />
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
