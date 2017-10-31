// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import has from 'lodash/has';
import { StyleSheet, css } from 'aphrodite';
import { colors } from '../../styles';

import type {
  CRDP$CSSProperty,
  CRDP$StyleSheetOrigin,
  CRDP$RuleMatch,
  CRDP$Value,
} from 'devtools-typed/domain/CSS';

type Props = {
  name: string,
  matchedStyles: CRDP$RuleMatch[],
  toggleCSSProperty: (ruleIdx: number) => (propIdx: number) => () => void,
};

type PropertyListArgs = {
  properties: CRDP$CSSProperty[],
  origin: CRDP$StyleSheetOrigin,
  toggleCSSPropertyForRule: (propIdx: number) => () => void,
};

class MatchedStylesView extends React.Component<Props> {
  props: Props;

  isDeclaredProperty = (origin: CRDP$StyleSheetOrigin) => (
    prop: CRDP$CSSProperty,
  ): boolean => {
    // If RuleMatch origin is 'user-agent', then none of the style's
    // properties will have SourceRanges.
    //
    // If RuleMatch origin is 'regular':
    // - DECLARED properties (margin: 10px) will have SourceRanges
    // - NONDECLARED properties (margin-left: 10px) will NOT have SourceRanges
    //
    // Example: if `margin: 10px` is declared, then we have the following
    //    generated properties:
    //        `margin: 10px`;         (with SourceRange)
    //        `margin-left: 10px`;    (no SourceRange)
    //        `margin-right: 10px`;   (no SourceRange)
    //        ...etc.
    //
    // We want to only render declared properties <=>
    //    those with SourceRanges and 'normal' origins.
    if (origin === 'user-agent') {
      return true;
    } else {
      return has(prop, 'range');
    }
  };

  renderSelectors(
    matchedIndices: number[],
    selectors: CRDP$Value[],
  ): React.Node {
    // return matchedIndices
    // .map(i => selectors[i].text)
    return selectors
      .map(x => x.text)
      .join(', ')
      .concat(' {');
  }

  renderRule = (ruleMatch: CRDP$RuleMatch, ruleIdx: number): ?React.Node => {
    const { toggleCSSProperty } = this.props;
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;

    const declaredProperties = style.cssProperties.filter(
      this.isDeclaredProperty(origin),
    );
    const selectors = this.renderSelectors(
      matchingSelectors,
      selectorList.selectors,
    );
    const propertyList = this.renderPropertyList({
      origin,
      properties: declaredProperties,
      toggleCSSPropertyForRule: toggleCSSProperty(ruleIdx),
    });

    if (declaredProperties.length > 0) {
      return (
        <li className={css(styles.cssRule)} key={ruleIdx}>
          {selectors}
          {propertyList}
          {'}'}
        </li>
      );
    }
  };

  renderPropertyList({
    properties,
    origin,
    toggleCSSPropertyForRule,
  }: PropertyListArgs): React.Element<'ul'> {
    return (
      <ul className={css(styles.cssPropertyList)}>
        {properties.map((prop, propIdx) => {
          const { name, value } = prop;
          const isDisabled =
            typeof prop.disabled === 'boolean' && prop.disabled;
          const isNotParsedOk =
            typeof prop.parsedOk === 'boolean' && !prop.parsedOk;
          return (
            <li
              key={propIdx}
              className={css(
                styles.cssProperty,
                isDisabled && styles.cssPropertyDisabled,
                isNotParsedOk && styles.cssPropertyNotParsedOk,
              )}
              onClick={toggleCSSPropertyForRule(propIdx)}
            >
              <span className={css(styles.clipboardOnly)}>{'  '}</span>
              <span
                className={css(
                  styles.cssPropertyName,
                  isDisabled && styles.cssPropertyDisabled,
                )}
              >
                {`${name}:`}
              </span>{' '}
              <span
                className={css(
                  styles.cssPropertyValue,
                  isDisabled && styles.cssPropertyDisabled,
                )}
              >
                {value}
              </span>
              {';'}
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { matchedStyles } = this.props;
    return (
      <ul className={css(styles.matchedStyles)}>
        {matchedStyles.map(this.renderRule)}
      </ul>
    );
  }
}

const styles = StyleSheet.create({
  matchedStyles: {
    padding: 0,
    listStyle: 'none',
    fontFamily: `'Inconsolata', monospace`,
    letterSpacing: '-0.01em',
  },
  cssRule: {
    marginBottom: 10,
  },
  cssPropertyList: {
    listStyle: 'none',
    padding: 0,
    marginLeft: 20,
  },
  cssProperty: {
    cursor: 'pointer',
  },
  cssPropertyDisabled: {
    textDecoration: 'line-through',
    color: colors.lightGrey,
  },
  cssPropertyNotParsedOk: {
    display: 'none',
  },
  clipboardOnly: {
    whiteSpace: 'pre',
    display: 'inline-block',
    width: 0,
    opacity: 0,
    pointerEvents: 'none',
  },
  cssPropertyValue: {
    color: colors.grey,
  },
  cssPropertyName: {
    color: colors.purple,
  },
});

export default MatchedStylesView;
