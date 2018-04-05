// @flow @format

const colors = {
  uiBlue: 'hsl(210, 87%, 53%)',
  green: '#668a36',
  blue: '#5581b9',
  lightBlue: '#eaf2fc',
  purple: '#7653C1',
  lightPurple: '#ece7f5',
  red: 'hsl(355, 50%, 56%)',
  lightRed: 'hsl(355, 50%, 94%)',
  yellow: '#fbf4b9',
  highlightYellow: '#ffa',
  highlightLime: 'hsla(78, 100%, 50%, 0.65)',
  pink: 'hsl(321, 40%, 46%)',
  lightPink: 'hsl(315, 50%, 94%)',
  highlightPink: 'hsla(0, 100%, 50%, 0.3)',
  lightestGrey: '#efefef',
  lightGrey: '#b7b7b7',
  medGrey: '#666',
  darkGrey: '#333',
  grey: '#111',
};

const spacing = {
  paddingSides: 12,
};

const zIndex = {
  tooltip: 30,
  dropdown: 3000,
};

const mixins = {
  a11yHidden: {
    position: 'absolute',
    left: -10000,
    top: 'auto',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  smallCaps: {
    textTransform: 'uppercase',
    fontSize: '0.9rem',
    color: '#999',
  },
  clipboardOnly: {
    whiteSpace: 'pre',
    display: 'inline-block',
    width: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  sansSerif: {
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
  },
  dropdown: {
    position: 'absolute',
    boxShadow: '0 5px 12px rgba(0,0,0,0.15)',
    zIndex: zIndex.dropdown,
    background: 'white',
    padding: 10,
  },
};

export { colors, mixins, spacing, zIndex };
