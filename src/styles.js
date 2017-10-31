// @flow @format

const colors = {
  green: '#668a36',
  blue: '#5581b9',
  lightBlue: '#eaf2fc',
  purple: '#7653C1',
  lightPurple: '#ece7f5',
  red: 'hsl(355, 50%, 56%)',
  lightRed: 'hsl(355, 50%, 94%)',
  yellow: '#fbf4b9',
  pink: 'hsl(321, 40%, 46%)',
  lightPink: 'hsl(315, 50%, 94%)',
  lightestGrey: '#efefef',
  lightGrey: '#b7b7b7',
  grey: '#111',
};

const spacing = {
  paddingSides: 12,
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
};

export { colors, mixins, spacing };
