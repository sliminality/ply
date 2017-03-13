// @flow
import React, { Component } from 'react';
import { pairsToObject } from '../../utils/state';

const filterStyles = (whitelist: string[]) =>
  (cs: ComputedStyle): ComputedStyle =>
    whitelist
      .map(prop => [prop, cs[prop]])
      .reduce(pairsToObject, {});

const ownStyles =
  (mine: ComputedStyle, parent: ComputedStyle): ComputedStyle =>
    Object.entries(mine)
      .filter(([ prop, val ]) => val !== parent[prop])
      .reduce(pairsToObject, {});

const whitelist = [
  'box-sizing', 'display', 'position',
  'margin-left', 'margin-right', 'margin-top',
  'margin-bottom',
  'padding-left', 'padding-right', 'padding-top',
  'padding-bottom',
  'height', 'width', 'line-height',
  'top', 'left', 'right', 'bottom', 'z-index',
];

export type StyleDetailsProps = {
  key: number,
  styles: Styles,
};

class StyleDetails extends Component {
  props: StyleDetailsProps;

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
      let computed;
      const { computedStyle, parentComputedStyle } = styles;
      const whitelisted = filterStyles(whitelist);
      const cs = whitelisted(computedStyle);
      if (parentComputedStyle) {
        const parent = whitelisted(parentComputedStyle);
        computed = ownStyles(cs, parent);
      } else {
        computed = cs;
      }
      content = JSON.stringify(computed, null, 2);
    }

    const toolbar =
      <div className="StyleDetails__settings">
        <label>
          <input className="uk-checkbox"
                 type="checkbox"
                 checked
          />
            Show Inherited
          </label>
      </div>;

    const props = {
      className: 'StyleDetails',
      key: nodeId,
    };
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
