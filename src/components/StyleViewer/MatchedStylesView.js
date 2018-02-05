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
  CRDP$CSSMedia,
  CRDP$MediaQuery,
  CRDP$Value,
  CRDP$SelectorList,
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

const Selectors = ({
  matchedIndices,
  selectors,
}: {
  matchedIndices: number[],
  selectors: Array<CRDP$Value>,
}): React.Node => (
  <span>
    {matchedIndices
      .map(i => selectors[i].text)
      // return selectors
      //   .map(x => x.text)
      .join(', ')}
  </span>
);

const MediaQuery = ({
  children,
  media,
}: {
  media: Array<CRDP$CSSMedia>,
  children?: React.Fragment,
}): React.Node => {
  // Filter out @import, inline/linked sheets, etc.
  const mediaQueries = media.filter(md => md.source === 'mediaRule');
  const mQ = mediaQueries[0];
  if (!mQ || !mQ.mediaList) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  // TODO: Handle > 1 media query.
  const mediaList: Array<CRDP$MediaQuery> = mQ.mediaList;
  const texts = mediaList
    .filter(mq => mq.active)
    .map(({ expressions }) =>
      expressions
        .map(({ feature, value, unit }) => `(${feature}: ${value}${unit})`)
        .join(' and '),
    )
    .join(' '); // TODO: Not sure what it means to have N > 2 mediaList items.
  const mediaRule = `@media ${texts} {`;
  return (
    <div>
      {mediaRule}
      <div className={css(styles.mediaRuleContents)}>{children}</div>
      {'}'}
    </div>
  );
};

class MatchedStylesView extends React.Component<Props> {
  props: Props;

  componentDidUpdate() {
    console.timeEnd('FROM RECEIVED TO COMPONENT');
    console.groupEnd();
  }

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

  renderRule = (ruleMatch: CRDP$RuleMatch, ruleIdx: number): ?React.Node => {
    const { toggleCSSProperty } = this.props;
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;

    const declaredProperties = style.cssProperties.filter(
      this.isDeclaredProperty(origin),
    );
    const propertyList = this.renderPropertyList({
      origin,
      properties: declaredProperties,
      toggleCSSPropertyForRule: toggleCSSProperty(ruleIdx),
    });
    const ruleComponent = (
      <div className={css(styles.cssRule)}>
        <Selectors
          matchedIndices={matchingSelectors}
          selectors={selectorList.selectors}
        />
        {' {'}
        {propertyList}
        {'}'}
      </div>
    );

    if (declaredProperties.length > 0) {
      return (
        <li className={css(styles.cssDeclaration)} key={ruleIdx}>
          {rule.media ? (
            <MediaQuery media={rule.media}>{ruleComponent}</MediaQuery>
          ) : (
            ruleComponent
          )}
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
  cssDeclaration: {
    marginBottom: 10,
  },
  mediaRuleContents: {
    paddingLeft: 10,
  },
  cssPropertyList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
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
