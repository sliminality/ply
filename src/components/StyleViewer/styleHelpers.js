// @flow
import fromPairs from 'lodash/fromPairs';

import type { ComputedStyle } from '../../types';

export const filterStyles = (whitelist: string[]) => (
  cs: ComputedStyle
): ComputedStyle =>
  fromPairs(whitelist.map(prop => [prop, cs[prop]]));

export const ownStyles = (
  mine: ComputedStyle,
  parent: ComputedStyle
): ComputedStyle =>
  fromPairs(Object.entries(mine)
    .filter(([prop, val]) => val !== parent[prop]));
