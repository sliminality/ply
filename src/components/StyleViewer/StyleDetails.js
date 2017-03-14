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

  renderToolbar({ nodeId }) {
    const checkboxProps = {
      className: 'uk-checkbox',
      type: 'checkbox',
    };
    const options = [
      <li key={0}>
        <label>
          <input {...checkboxProps} checked />
          Show Inherited
        </label>
      </li>,
      <li key={1}>
        <label>
          <input {...checkboxProps} checked />
          Show Inherited
        </label>
      </li>,
      <li className="StyleDetails__node-id">
        Node ID: {nodeId}
      </li>
    ];
    const tabsClassName = [
      'uk-tab',
      'StyleDetails__tabs',
    ].join(' ');

    return (
      <ul className={tabsClassName}>
          <li className="uk-active">
            <a href="#">Computed</a>
          </li>
          <li><a href="#">Full</a></li>
          <ul className="StyleDetails__options">
            {options}
          </ul>
      </ul>
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
        <div className="StyleDetails__content">
          {content}
        </div>
      </div>
    );
  }
};

export default StyleDetails;
