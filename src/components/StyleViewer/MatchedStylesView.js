// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { has, zip } from 'lodash';
import { StyleSheet, css } from 'aphrodite';
import { colors } from '../../styles';
import type { CSSRuleAnnotation } from '../../types';

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
  matchedStyles: Array<CRDP$RuleMatch>,
  ruleAnnotations?: Array<?CSSRuleAnnotation>,
  toggleCSSProperty: (ruleIdx: number) => (propIdx: number) => () => void,
  highlightSelectorAll: string => void,
  clearHighlight: () => void,
};

type PropertyListArgs = {
  properties: Array<CRDP$CSSProperty>,
  origin: CRDP$StyleSheetOrigin,
  toggleCSSPropertyForRule: (propIdx: number) => () => void,
  annotation?: CSSRuleAnnotation,
};

const Selectors = ({
  matchedIndices,
  selectors,
  highlightSelectorAll,
  clearHighlight,
}: {
  matchedIndices: number[],
  selectors: Array<CRDP$Value>,
  highlightSelectorAll: string => void,
  clearHighlight: () => void,
}): React.Node => {
  const selectorList = matchedIndices
    .map(i => selectors[i].text)
    // return selectors
    //   .map(x => x.text)
    .join(', ');
  return (
    <span
      onMouseEnter={() => highlightSelectorAll(selectorList)}
      onMouseLeave={clearHighlight}
    >
      {selectorList}
    </span>
  );
};

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

  renderRule = (
    ruleMatch: CRDP$RuleMatch,
    ruleIdx: number,
    annotation?: CSSRuleAnnotation,
  ): ?React.Node => {
    const {
      toggleCSSProperty,
      highlightSelectorAll,
      clearHighlight,
    } = this.props;
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;

    const declaredProperties = style.cssProperties.filter(
      this.isDeclaredProperty(origin),
    );
    const propertyList = this.renderPropertyList({
      origin,
      properties: declaredProperties,
      toggleCSSPropertyForRule: toggleCSSProperty(ruleIdx),
      annotation,
    });
    const ruleComponent = (
      <div className={css(styles.cssRule)}>
        <Selectors
          matchedIndices={matchingSelectors}
          selectors={selectorList.selectors}
          highlightSelectorAll={highlightSelectorAll}
          clearHighlight={clearHighlight}
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
          {annotation && (
            <div className={css(styles.hint)}>Likely base style</div>
          )}
        </li>
      );
    }
  };

  renderPropertyList({
    properties,
    origin,
    toggleCSSPropertyForRule,
    annotation,
  }: PropertyListArgs): React.Element<'ul'> {
    // TODO: Come up with a more systematic way to handle different
    // types of annotations.
    let shadowed;
    if (annotation && annotation.type === 'BASE_STYLE') {
      shadowed = new Set([...annotation.shadowedProperties]);
    }

    return (
      <ul className={css(styles.cssPropertyList)}>
        {properties.map((prop, propIdx) => {
          const { name, value } = prop;
          const isDisabled =
            typeof prop.disabled === 'boolean' && prop.disabled;
          const isNotParsedOk =
            typeof prop.parsedOk === 'boolean' && !prop.parsedOk;
          const isShadowed = shadowed && shadowed.has(propIdx);

          return (
            <li
              key={propIdx}
              className={css(
                styles.cssProperty,
                isDisabled && styles.cssPropertyDisabled,
                isNotParsedOk && styles.cssPropertyNotParsedOk,
                isShadowed && styles.cssPropertyShadowed,
              )}
              onClick={toggleCSSPropertyForRule(propIdx)}
            >
              <span className={css(styles.clipboardOnly)}>{'  '}</span>
              {isDisabled && (
                <span className={css(styles.clipboardOnly)}>{'/* '}</span>
              )}
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
              {isDisabled && (
                <span className={css(styles.clipboardOnly)}>{' */'}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  render() {
    const { matchedStyles, ruleAnnotations } = this.props;

    // If ruleAnnotations are provided, but stale wrt the stored RuleMatch
    // (e.g. if a media query changes), just ignore the rule annotations to prevent
    // crashing.
    // TODO: Fix this when we develop a more permanent way of associating rule
    // annotations with CSSRules.
    const annotationsValid =
      ruleAnnotations && matchedStyles.length === ruleAnnotations.length;

    return (
      <ul className={css(styles.matchedStyles)}>
        {annotationsValid
          ? zip(matchedStyles, ruleAnnotations).map(([rule, annotation], idx) =>
              this.renderRule(rule, idx, annotation),
            )
          : matchedStyles.map((rule, idx) => this.renderRule(rule, idx))}
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
    display: 'flex',
    justifyContent: 'space-between',
  },
  hint: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    fontStyle: 'italic',
    '::after': {
      content: '"?"',
      display: 'inline-block',
      marginLeft: 10,
      color: 'white',
      minWidth: 20,
      backgroundColor: colors.grey,
      borderRadius: 25,
      textAlign: 'center',
      cursor: 'pointer',
      fontStyle: 'normal',
    },
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
  cssPropertyShadowed: {
    backgroundColor: colors.highlightYellow,
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
