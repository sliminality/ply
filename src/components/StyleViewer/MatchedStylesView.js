// @flow @format
/* eslint-disable no-use-before-define */
import * as React from 'react';
import { has, zip } from 'lodash';
import { StyleSheet, css } from 'aphrodite';
import { colors, mixins, spacing } from '../../styles';
import {
  isPropertyActiveInMask,
  getEffectiveValueForProperty,
} from '../../styleHelpers';
import Icon from '../shared/Icon';
import Tooltip from '../shared/Tooltip';

import type {
  StyleSettings,
  CSSRuleAnnotation,
  NodeStyleMask,
  NodeStyleDependencies,
  CSSPropertyIndices,
  CSSPropertyRelation,
} from '../../types';

import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';
import type {
  CRDP$CSSProperty,
  CRDP$StyleSheetOrigin,
  CRDP$RuleMatch,
  CRDP$CSSMedia,
  CRDP$MediaQuery,
  CRDP$Value,
} from 'devtools-typed/domain/CSS';

type Props = {
  name: string,
  matchedStyles: Array<CRDP$RuleMatch>,
  mask?: NodeStyleMask,
  dependencies?: NodeStyleDependencies,
  ruleAnnotations?: Array<?CSSRuleAnnotation>,

  focusedProperty: ?CRDP$CSSProperty,
  getCSSProperty: (CRDP$NodeId, number, number) => ?CRDP$CSSProperty,

  toggleCSSProperty: (ruleIdx: number) => (propIdx: number) => () => void,
  highlightSelectorAll: string => void,
  clearHighlight: () => void,
  toggleFocusedProperty: (ruleIndex: number) => (propertyIndex: number) => void,
  getRelation: (
    ruleIndex: number,
  ) => (propertyIndex: number) => ?CSSPropertyRelation,
  getEffectiveValue: (property: string) => void,

  settings: StyleSettings,
};

type PropertyListArgs = {
  properties: Array<CRDP$CSSProperty>,
  origin: CRDP$StyleSheetOrigin,
  annotation?: CSSRuleAnnotation,
  checkMask?: (propertyIndex: number) => boolean,
  toggleCSSPropertyForRule: (propertyIdx: number) => () => void,
  toggleFocusedProperty: (propertyIndex: number) => void,
  getRelation: (propertyIndex: number) => ?CSSPropertyRelation,
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

  renderRule = (
    ruleMatch: CRDP$RuleMatch,
    ruleIdx: number,
    annotation?: CSSRuleAnnotation,
  ): ?React.Node => {
    const {
      mask,
      toggleCSSProperty,
      highlightSelectorAll,
      clearHighlight,
      toggleFocusedProperty,
      getRelation,
      settings,
    } = this.props;
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;
    const { hidePruned } = settings;

    // Don't render rules with user-agent origins.
    if (origin === 'user-agent') {
      return null;
    }

    const declaredProperties = style.cssProperties.filter(
      this.isDeclaredProperty(origin),
    );
    const checkMask = mask && isPropertyActiveInMask(mask)(ruleIdx);
    const propertyList = this.renderPropertyList({
      properties: declaredProperties,
      origin,
      toggleCSSPropertyForRule: toggleCSSProperty(ruleIdx),
      toggleFocusedProperty: toggleFocusedProperty(ruleIdx),
      getRelation: getRelation(ruleIdx),
      annotation,
      checkMask,
    });
    const allPropertiesDisabled = style.cssProperties.every(
      ({ disabled, parsedOk }) =>
        disabled || (typeof parsedOk === 'boolean' && !parsedOk),
    );
    const disabledStyle = hidePruned ? styles.hidden : styles.disabledColor;

    const ruleComponent = (
      <div
        className={css(
          styles.cssRule,
          allPropertiesDisabled && styles.disabledColor,
        )}
      >
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
        <li
          className={css(
            styles.cssDeclaration,
            allPropertiesDisabled && disabledStyle,
          )}
          key={ruleIdx}
        >
          {rule.media ? (
            <MediaQuery media={rule.media}>{ruleComponent}</MediaQuery>
          ) : (
            ruleComponent
          )}
          {annotation && this.renderRuleAnnotation(annotation)}
        </li>
      );
    }
  };

  renderRuleAnnotation(annotation: CSSRuleAnnotation) {
    switch (annotation.type) {
      case 'BASE_STYLE':
        return (
          <div className={css(styles.ruleAnnotation)}>
            <Tooltip
              title={
                <span>
                  These properties likely represent a{' '}
                  <strong>base style</strong>, applied to multiple elements on
                  the page. This particular element overrides some of the
                  default values (highlighted in yellow).
                </span>
              }
              direction="bottom"
              isLarge="true"
            >
              Likely base style <Icon type="info" />
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }

  renderPropertyList = ({
    properties,
    origin,
    annotation,
    checkMask,
    toggleCSSPropertyForRule,
    toggleFocusedProperty,
    getRelation,
  }: PropertyListArgs): React.Element<'ul'> => {
    const { mask, focusedProperty, getEffectiveValue, settings } = this.props;
    const { hidePruned } = settings;

    // TODO: Come up with a more systematic way to handle different
    // types of annotations.
    let shadowed;
    if (annotation && annotation.type === 'BASE_STYLE') {
      shadowed = new Set([...annotation.shadowedProperties]);
    }

    return (
      <ul className={css(styles.cssPropertyList)}>
        {properties.map((property, propertyIndex) => {
          const { name, value } = property;
          const isNotParsedOk =
            typeof property.parsedOk === 'boolean' && !property.parsedOk;
          const isShadowed = shadowed && shadowed.has(propertyIndex);

          // Disabled properties are either pruned or toggled off.
          const isDisabled =
            typeof property.disabled === 'boolean' && property.disabled;
          const isPruned = checkMask && !checkMask(propertyIndex);

          const relation = getRelation(propertyIndex);
          const isFocused = relation === 'FOCUSED';
          const propertyStyles: { [CSSPropertyRelation]: Object } = {
            DEPENDANT_DISABLED: styles.cssPropertyDisabled,
            DEPENDANT: styles.cssPropertyDependant,
            FOCUSED: styles.cssPropertyFocused,
          };
          // HACK: Don't want to apply hanging indent to shadowed
          // properties.
          const propertyRelationStyle = relation
            ? propertyStyles[relation]
            : isShadowed ? null : styles.hangingIndent;

          const tooltip =
            relation === 'DEPENDANT' ? (
              <span>
                This property depends on{' '}
                <code>{focusedProperty && focusedProperty.text}</code>
              </span>
            ) : (
              <span>
                This property is a "default" setting for these base styles. The
                current element <strong>overrides</strong> these values with
                more specific styles (higher in the cascade).
              </span>
            );

          const shadowedHandlers = {
            onMouseEnter: () => getEffectiveValue(name),
          };

          const propertyText = (
            <span
              className={css(
                styles.cssPropertyText,
                isDisabled && styles.cssPropertyDisabled,
                propertyRelationStyle,
                isPruned && styles.cssPropertyPruned,
                isPruned && hidePruned && styles.hidden,
                isShadowed && styles.cssPropertyShadowed,
              )}
              onClick={toggleCSSPropertyForRule(propertyIndex)}
              {...(isShadowed ? shadowedHandlers : null)}
            >
              <span className={css(styles.clipboardOnly)}>{'  '}</span>
              {isDisabled && (
                <span className={css(styles.clipboardOnly)}>{'/* '}</span>
              )}
              <span
                className={css(
                  styles.cssPropertyName,
                  (relation === 'DEPENDANT_DISABLED' || isDisabled) &&
                    styles.disabledColor,
                )}
              >
                {`${name}:`}{' '}
                <span
                  className={css(
                    styles.cssPropertyValue,
                    (relation === 'DEPENDANT_DISABLED' || isDisabled) &&
                      styles.disabledColor,
                  )}
                >
                  {value}
                </span>
                {';'}
                {isDisabled && (
                  <span className={css(styles.clipboardOnly)}>{' */'}</span>
                )}
              </span>
            </span>
          );

          return (
            <li
              key={propertyIndex}
              className={css(
                styles.cssProperty,
                isNotParsedOk && styles.cssPropertyNotParsedOk,
              )}
            >
              {relation === 'DEPENDANT' || isShadowed ? (
                <Tooltip
                  title={tooltip}
                  isLarge={isShadowed}
                  direction="bottom"
                >
                  {propertyText}
                </Tooltip>
              ) : (
                propertyText
              )}
              {/**
              * Show dependants for pruned, active properties.
              * TODO: add title prop to <Icon> after study, or make it toggleable
              * from settings.
              */
              mask &&
                !isDisabled && (
                  <Tooltip
                    title={isFocused ? 'Hide dependants' : 'Show dependants'}
                    direction="left"
                  >
                    <Icon
                      className={css(
                        isFocused
                          ? styles.findDepsIconDark
                          : styles.findDepsIcon,
                      )}
                      type="social"
                      transform="scale(0.8) rotate(90)"
                      onClick={() => toggleFocusedProperty(propertyIndex)}
                    />
                  </Tooltip>
                )}
            </li>
          );
        })}
      </ul>
    );
  };

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
      <div className={css(styles.container)}>
        <ul className={css(styles.matchedStylesList)}>
          {annotationsValid
            ? zip(
                matchedStyles,
                ruleAnnotations,
              ).map(([rule, annotation], idx) =>
                this.renderRule(rule, idx, annotation),
              )
            : matchedStyles.map((rule, idx) => this.renderRule(rule, idx))}
        </ul>
      </div>
    );
  }
}

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
    <div className={css(styles.fullWidth)}>
      {mediaRule}
      <div className={css(styles.mediaRuleContents)}>{children}</div>
      {'}'}
    </div>
  );
};

const sharedStyles = {
  strikethrough: {
    textDecoration: 'line-through',
    // Needed for strikethrough color.
    color: colors.lightGrey,
  },
  greyout: {
    color: colors.lightGrey,
  },
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  container: {
    padding: `${spacing.paddingSides / 2}px ${spacing.paddingSides}px`,
    height: '100%',
  },
  matchedStylesList: {
    padding: 0,
    listStyle: 'none',
    fontFamily: `'Inconsolata', monospace`,
    letterSpacing: '-0.01em',
  },
  cssDeclaration: {
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',

    // For rule annotation.
    position: 'relative',
  },
  mediaRuleContents: {
    paddingLeft: 10,
  },
  cssRule: {
    width: '100%',
  },
  cssRuleDisabled: {
    ...sharedStyles.greyout,
    // TODO: Some way to hide consecutive styles.
  },
  cssPropertyList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    marginLeft: 20,
  },

  /**
   * Annotations
   */
  ruleAnnotation: {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  /**
   * CSS property styles
   */
  hangingIndent: {
    textIndent: '-1.5em',
    marginLeft: '1.5em',
  },
  cssProperty: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
  },
  cssPropertyText: {
    // Accommodate icon.
    maxWidth: 'calc(100% - 25px)',
    padding: '0 4px',
  },
  cssPropertyDependant: {
    backgroundColor: colors.highlightPink,
    boxShadow: `0 0 5px 3px ${colors.highlightPink}`,
    borderRadius: 2,
  },
  cssPropertyFocused: {
    backgroundColor: colors.highlightYellow,
    boxShadow: `0 0 5px 3px ${colors.highlightYellow}`,
    borderRadius: 2,
  },
  disabledColor: {
    ...sharedStyles.greyout,
  },
  hidden: {
    display: 'none',
  },
  cssPropertyDisabled: {
    ...sharedStyles.strikethrough,
    ...sharedStyles.greyout,

    ':hover': {
      textDecoration: 'none',
    },
  },
  cssPropertyPruned: {
    '::after': {
      content: '" (pruned)"',
      color: colors.lightGrey,
    },
  },
  cssPropertyNotParsedOk: {
    display: 'none',
  },
  cssPropertyShadowed: {
    backgroundColor: colors.highlightYellow,
    boxShadow: `0 0 5px 3px ${colors.highlightYellow}`,
  },
  clipboardOnly: {
    ...mixins.clipboardOnly,
  },
  cssPropertyValue: {
    color: colors.grey,
  },
  cssPropertyName: {
    color: colors.purple,
  },
  findDepsIcon: {
    ...sharedStyles.greyout,
  },
  findDepsIconDark: {
    colors: colors.medGrey,
  },
});

export default MatchedStylesView;
