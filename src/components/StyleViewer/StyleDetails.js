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

  renderToolbar() {
    const inputProps = {
      className: 'uk-checkbox',
      type: 'checkbox',
    };
    return (
      <div className="StyleDetails__settings">
        <label>Show Inherited
          <input {...inputProps} checked />
        </label>
      </div>
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
      ;
      const { computedStyle, parentComputedStyle } = styles;
      const cs = filterStyles(whitelist)(computedStyle);
      const computed = parentComputedStyle
        ? ownStyles(cs, parentComputedStyle)
        : cs;
      content = JSON.stringify(computed, null, 2);
    } else {
      content = 'Loading styles...';
    }

    const props = {
      className: 'StyleDetails',
      key: nodeId,
    };
    const toolbar = this.renderToolbar();

    return (
      <div {...props}>
        {toolbar}
        {nodeId}
        {content}
      </div>
    );
  }
};

export default StyleDetails;
