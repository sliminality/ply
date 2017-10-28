// @flow
import { pairsToObject } from '../../utils/state';

import type { ComputedStyle } from '../../types';

export const filterStyles = (whitelist: string[]) => (
  cs: ComputedStyle
): ComputedStyle =>
  whitelist.map(prop => [prop, cs[prop]]).reduce(pairsToObject, {});

export const ownStyles = (
  mine: ComputedStyle,
  parent: ComputedStyle
): ComputedStyle =>
  Object.entries(mine)
    .filter(([prop, val]) => val !== parent[prop])
    .reduce(pairsToObject, {});
