// @flow
import React, { Component } from 'react';
import { filterStyles, ownStyles } from './styleHelpers';

const whitelist = [
  'box-sizing', 'display', 'position',
  'margin-left', 'margin-right', 'margin-top',
  'margin-bottom',
  'padding-left', 'padding-right', 'padding-top',
  'padding-bottom',
  'height', 'width', 'line-height',
  'top', 'left', 'right', 'bottom', 'z-index',
];

class StyleDetails extends Component {
  props: {
    key: number,
    styles: Styles,
  };

  renderToolbar({ nodeId }) {
    const inputProps = {
      className: 'uk-checkbox',
      type: 'checkbox',
    };
    return (
      <div className="StyleDetails__settings">
        <label>
          <input {...inputProps} checked />
          Show Inherited
        </label>
        <span>Node ID: {nodeId}</span>
      </div>
    );
  }

  renderComputedStyleTable(cs: ComputedStyle) {
    const tableClassName = [
      'StyleDetails__computed-list',
      'uk-table',
      'uk-table-small',
      'uk-table-striped',
    ].join(' ');

    const tableRow = ([ prop, val ]) => (
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

  render() {
    const { styles, nodeId } = this.props;
    let content = null;
    if (styles) {
      /**
       * Filter own computed styles to the subset we care about.
       * If parentComputedStyle is not null, filter those too,
       * then take the set difference to get the element's own
       * computed styles.
       */
      const { computedStyle, parentComputedStyle } = styles;
      const cs = filterStyles(whitelist)(computedStyle);
      const computed = parentComputedStyle
        ? ownStyles(cs, parentComputedStyle)
        : cs;
      content = this.renderComputedStyleTable(computed, null, 2);
    } else {
      content = 'Loading styles...';
    }

    const props = {
      className: 'StyleDetails',
      key: nodeId,
    };
    const toolbar = this.renderToolbar({ nodeId });

    return (
      <div {...props}>
        {toolbar}
        {content}
      </div>
    );
  }
};

export default StyleDetails;
