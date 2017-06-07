// @flow
import React, { Component } from 'react';
import JSONTree from 'react-json-tree';
import has from 'lodash/has';
import './MatchedStylesView.css';

type Props = {
  toggleCSSProperty: (ruleIndex: number) => (propIndex: number) => void,
  name: string,
  matchedStyles: MatchedCSSRules,
};

type PropertyListArgs = {
  properties: CSSProperty[],
  origin: StyleSheetOrigin,
  toggleCSSPropertyForRule: (propIndex: number) => void,
};

class MatchedStylesView extends Component {
  constructor(props) {
    super(props);
  }

  renderRule(ruleMatch: MatchedCSSRule, ruleIndex: number): React.Element<any> {
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;

    const selectors = MatchedStylesView.renderSelectors(
      matchingSelectors,
      selectorList.selectors
    );

    const propertyList = MatchedStylesView.renderPropertyList({
      origin,
      properties: style.cssProperties,
      toggleCSSPropertyForRule: this.toggleCSSPropertyForNode(ruleIndex),
    });

    const ruleProps = {
      key: ruleIndex,
      className: 'MatchedStylesView__rule',
    };

    return (
      <li {...ruleProps}>
        {selectors}
        {propertyList}
      </li>
    );
  }

  static renderSelectors(
    matchedIndices: number[],
    selectors: Value[]
  ): React.Element<Any> {
    // Only render the matched selectors on the style.
    const matched: Value[] = matchedIndices.map(i => selectors[i].text);
    const selectorList: React.Element<Any>[] = matched.map((text, i) => (
      <li className="MatchedStylesView__selector" key={i}>{text}</li>
    ));

    return (
      <ul className="MatchedStylesView__selector-list">
        {selectorList}
      </ul>
    );
  }

  static renderPropertyList({
    properties,
    origin,
    toggleCSSPropertyForRule,
  }: PropertyListArgs): React.Element<Any> {
    /**
     * This is a bit confusing, but it has to do with how the Chrome protocol returns
     * styles.
     *
     * If the RuleMatch origin is 'user-agent', then none of the style's properties
     * will have SourceRanges.
     *
     * If the RuleMatch origin is 'regular', however, then:
     * - style's DECLARED properties (margin: 10px) will have SourceRanges
     * - styles's NONDECLARED properties (margin-left: 10px) will NOT have SourceRanges
     *
     * Example:
     *
     * DECLARED:
     *    `margin: 10px`;
     * GENERATED:
     *    `margin: 10px`;         (with SourceRange)
     *    `margin-left: 10px`;    (no SourceRange)
     *    `margin-right: 10px`;   (no SourceRange)
     *    ...etc.
     *
     * Basically, we want to only render declared properties (those with SourceRanges
     * and 'normal' origins).
     */
    const allowPropsFilter = (prop: CSSProperty): boolean => {
      if (origin === 'user-agent') {
        return true;
      } else {
        // Require properties to have a SourceRange.
        return has(prop, 'range');
      }
    };

    const declared = properties
      .filter(allowPropsFilter)
      .map((prop, propIndex) => {
        const { name, value } = prop;
        const propertyProps = {
          key: propIndex,
          className: 'MatchedStylesView__property',
          onClick: () => toggleCSSPropertyForRule(propIndex),
        };

        // TODO: Optimistic UI change.
        if (has(prop, 'disabled') && prop.disabled) {
          propertyProps.className += ' disabled';
        }

        return (
          <li {...propertyProps}>
            <span className="MatchedStylesView__property-name">
              {name}
            </span>
            <span className="MatchedStylesView__property-value">
              {value}
            </span>
          </li>
        );
      });

    return (
      <ul className="MatchedStylesView__property-list">
        {declared}
        <JSONTree data={properties} />
      </ul>
    );
  }

  /**
   * The component as a whole receives a function
   * toggleCSSProperty : ruleIndex => propIndex => void
   * with the NodeId already bound.
   *
   * TODO: This function should eventually have optimistic UI changes.
   * When a property is toggled to be disabled, we add it immediately to
   * this.state.disabled which is the source of truth for applying the
   * CSS className `disabled` in the render function.
   */
  toggleCSSPropertyForNode = (ruleIndex: number) => (propIndex: number) => {
    this.props.toggleCSSProperty(ruleIndex)(propIndex);

    // TODO: Optimistic UI change here.
  };

  render() {
    const rules = this.props.matchedStyles.map((ruleMatch, i) =>
      this.renderRule(ruleMatch, i)
    );
    return (
      <ul className="MatchedStylesView">
        {rules}
      </ul>
    );
  }
}

export default MatchedStylesView;
