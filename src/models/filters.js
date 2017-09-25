// @flow
import type { CSSProperty } from './defaults';

/**
 * Allow users to define their own computed property filters
 * for some aspect of interest.
 */
export type Filter = {
  name: string,
  props: Set<CSSProperty>,
};

/**
 * Predicate for filtering down an array of [property, value] pairs.
 */
const filterPred = (fil: Filter) => ([prop, _]): boolean => fil.props.has(prop);

/**
 * Define some basic filters to start with.
 */
const FILTERS = {
  layoutFilter: {
    name: 'Layout',
    props: new Set(['position', 'z-index']),
  },
};

export { filterPred, FILTERS };
