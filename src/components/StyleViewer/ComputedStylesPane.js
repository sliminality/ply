// @flow
import React, { Component } from 'react';
import { ownStyles } from './styleHelpers';
import { FILTERS, filterPred } from '../../models/filters.js';
import { pairsToObject } from '../../utils/state';

class ComputedStylesPane extends Component {
  props: {
    computedStyle: ComputedStyle,
    parentComputedStyle: ComputedStyle,
  };

  /**
  * Filter own computed styles to the subset we care about.
  * If parentComputedStyle is not null, filter those too,
  * then take the set difference to get the element's own
  * computed styles.
  */
  filterComputedStyles() {
    const { computedStyle, parentComputedStyle } = this.props;
    const layoutFilterPred = filterPred(FILTERS.layoutFilter);
    const cs: ComputedStyle = Object.keys(computedStyle)
      .map(k => [k, computedStyle[k]])
      .filter(layoutFilterPred)
      .reduce(pairsToObject, {});

    const computed: ComputedStyle = parentComputedStyle
      ? ownStyles(cs, parentComputedStyle)
      : cs;

    return computed;
  }

  render() {
    const tableClassName = [
      'ComputedStylesPane',
      'uk-table',
      'uk-table-small',
      'uk-table-striped',
    ].join(' ');

    const tableRow = ([prop, val]) => (
      <tr className="Style__computed-style" key={prop}>
        <td className="Style__prop-name">{prop}</td>
        <td className="Style__prop-value">{val}</td>
      </tr>
    );

    const cs = this.filterComputedStyles();
    const rows = Object.entries(cs).map(tableRow);
    const content = rows.length > 0 ? rows : <span>No computed styles</span>;

    return (
      <table className={tableClassName}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Computed</th>
          </tr>
        </thead>
        <tbody className="ComputedStylesPane__content">
          {content}
        </tbody>
      </table>
    );
  }
}

export default ComputedStylesPane;
