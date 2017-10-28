// @flow
import React, { Component } from 'react';
import { ownStyles } from './styleHelpers';
import { pairsToObject } from '../../utils/state';
import './ComputedStylesView.css';

import type { ComputedStyle } from '../../types';
import type { CSSProperty } from './types';

/**
 * Allow users to define their own computed property filters
 * for some aspect of interest.
 */
export type Filter = {
  name: string,
  props: Set<CSSProperty>,
};

// Predicate for filtering down an array of [property, value] pairs.
// $FlowFixMe - Flow doesn't know that `prop` can be in the Set<CSSProperty>
const createFilter = ({ props }: Filter) => (prop: string) => !!props.has(prop);

const layoutFilter = {
  name: 'Layout',
  props: (new Set(['position', 'z-index']): Set<CSSProperty>),
};

type Props = {
  computedStyle: ComputedStyle,
  parentComputedStyle: ComputedStyle,
};

class ComputedStylesView extends Component<Props> {
  props: Props;

  /**
  * Filter own computed styles to the subset we care about.
  * If parentComputedStyle is not null, filter those too,
  * then take the set difference to get the element's own
  * computed styles.
  */
  filterComputedStyles() {
    const { computedStyle, parentComputedStyle } = this.props;
    const cs: ComputedStyle = Object.keys(computedStyle)
      // Flow doesn't know that all the keys will be valid CSSProperties.
      .filter(createFilter(layoutFilter))
      .map((prop: string) => [prop, computedStyle[prop]])
      .reduce(pairsToObject, {});

    const computed: ComputedStyle = parentComputedStyle
      ? ownStyles(cs, parentComputedStyle)
      : cs;

    return computed;
  }

  render() {
    const tableClassName = [
      'ComputedStylesView',
      'uk-table',
      'uk-table-small',
      'uk-table-striped',
    ].join(' ');

    const cs = this.filterComputedStyles();
    const rows = Object.keys(cs).map((prop: string) => (
      <tr className="Style__computed-style" key={prop}>
        <td className="Style__prop-name">{prop}</td>
        <td className="Style__prop-value">{cs[prop]}</td>
      </tr>
    ));
    const content = rows.length > 0 ? rows : <span>No computed styles</span>;

    return (
      <table className={tableClassName}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Computed</th>
          </tr>
        </thead>
        <tbody className="ComputedStylesView__content">{content}</tbody>
      </table>
    );
  }
}

export default ComputedStylesView;
