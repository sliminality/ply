// @flow
import fromPairs from 'lodash/fromPairs';

import type { ComputedStyle } from '../../types';

export const filterStyles = (whitelist: string[]) => (
  cs: ComputedStyle
): ComputedStyle =>
  // $FlowFixMe - `prop` is guaranteed to be a CSS property.
  fromPairs(whitelist.map(prop => [prop, cs[prop]]));

export const ownStyles = (
  mine: ComputedStyle,
  parent: ComputedStyle
): ComputedStyle =>
  fromPairs(Object.entries(mine)
    // $FlowFixMe - `prop` is guaranteed to be a CSS property.
    .filter(([prop, val]) => val !== parent[prop]));
