// @flow
import React, { Component } from 'react';
import { filterStyles, ownStyles } from './styleHelpers';
import { Filter, FILTERS, filterPred } from '../../models/filters.js';
import { pairsToObject } from '../../utils/state';

class ComputedStylesPane extends Component {
  props: {
    styles: NodeStyles,
    nodeId: NodeId,
  };

  renderComputedStyleTable(cs: ComputedStyle) {
    const tableClassName = [
      'ComputedStylesPane__computed-list',
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

    const rows = Object.entries(cs).map(tableRow);

    return (
      <table className={tableClassName}>
        <thead>
          <tr>
            <th>Property</th>
            <th>Computed</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }

  renderToolbar({ nodeId }: { nodeId: NodeId }) {
    const checkboxProps = {
      className: 'uk-checkbox',
      type: 'checkbox',
    };
    const options = [
      // <li key={0}>
      // <label>
      // <input {...checkboxProps} checked />
      // Show Inherited
      // </label>
      // </li>,
      <li className="ComputedStylesPane__node-id" key={0}>
        Node ID: {nodeId}
      </li>,
    ];
    const tabsClassName = ['uk-tab', 'ComputedStylesPane__tabs'].join(' ');
    return (
      <ul className={tabsClassName}>
        <li className="uk-active">
          <a href="#">Computed</a>
        </li>
        <ul className="ComputedStylesPane__options">
          {options}
        </ul>
      </ul>
    );
  }

  render() {
    const {
      styles,
      nodeId,
    }: { styles: NodeStyles, nodeId: NodeId } = this.props;
    let content = null;
    if (styles) {
      /**
       * Filter own computed styles to the subset we care about.
       * If parentComputedStyle is not null, filter those too,
       * then take the set difference to get the element's own
       * computed styles.
       */
      const { computedStyle, parentComputedStyle } = styles;

      const layoutFilterPred = filterPred(FILTERS.layoutFilter);
      const cs: ComputedStyle = Object.keys(computedStyle)
        .map(k => [k, computedStyle[k]])
        .filter(layoutFilterPred)
        .reduce(pairsToObject, {});

      const computed: ComputedStyle = parentComputedStyle
        ? ownStyles(cs, parentComputedStyle)
        : cs;
      content = this.renderComputedStyleTable(computed, null, 2);
    } else {
      content = (
        <span className="ComputedStylesPane__loading">
          Loading styles...;
        </span>
      );
    }

    const props = {
      className: 'ComputedStylesPane',
      key: nodeId,
    };
    const toolbar = this.renderToolbar({ nodeId });

    return (
      <div {...props}>
        {toolbar}
        <div className="ComputedStylesPane__content">
          {content}
        </div>
      </div>
    );
  }
}

export default ComputedStylesPane;
