// @flow
import React, { Component } from 'react';
import has from 'lodash/has';
import './MatchedStylesView.css';

type Props = {
  toggleCSSProperty: (ruleIndex: number) => (propIndex: number) => void,
  name: string,
  matchedStyles: RuleMatch[],
};

type PropertyListArgs = {
  properties: CSSProperty[],
  origin: StyleSheetOrigin,
  toggleCSSPropertyForRule: (propIndex: number) => void,
};

class MatchedStylesView extends Component {
  props: Props;
  state: {
    hoverMode: boolean,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      hoverMode: false,
    };
  }

  toggleHoverMode = () => {
    this.setState({
      hoverMode: !this.state.hoverMode,
    });
  };

  renderRule(ruleMatch: RuleMatch, ruleIndex: number): React.Element<any> {
    const { matchingSelectors, rule } = ruleMatch;
    const { selectorList, style, origin } = rule;

    const selectors = MatchedStylesView.renderSelectors(
      matchingSelectors,
      selectorList.selectors
    );

    const propertyList = this.renderPropertyList({
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
  ): React.Element<any> {
    // Only render the matched selectors on the style.
    const matched: Value[] = matchedIndices.map(i => selectors[i].text);
    const selectorList: React.Element<any>[] = matched.map((text, i) => (
      <li className="MatchedStylesView__selector" key={i}>{text}</li>
    ));

    return (
      <ul className="MatchedStylesView__selector-list">
        {selectorList}
      </ul>
    );
  }

  renderPropertyList({
    properties,
    origin,
    toggleCSSPropertyForRule,
  }: PropertyListArgs): React.Element<any> {
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
          cssProp: prop,
        };

        const handleHover = () => {
          if (this.state.hoverMode) {
            toggleCSSPropertyForRule(propIndex);
          }
        };

        const propertyEventHandlers = {
          onClick: () => toggleCSSPropertyForRule(propIndex),
          onMouseOver: handleHover,
          onMouseLeave: handleHover,
        };

        // TODO: Optimistic UI change.
        if (has(prop, 'disabled') && prop.disabled) {
          propertyProps.className += ' disabled';
        }
        if (has(prop, 'parsedOk') && !prop.parsedOk) {
          propertyProps.className += ' not-parsed-ok';
        }

        return (
          <li {...propertyProps}>
            <span
              className="MatchedStylesView__property-name"
              {...propertyEventHandlers}
            >
              {name}
            </span>
            <span
              className="MatchedStylesView__property-value"
              {...propertyEventHandlers}
            >
              {value}
            </span>
          </li>
        );
      });

    return (
      <ul className="MatchedStylesView__property-list">
        {declared}
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
    const rules = this.props.matchedStyles.map((ruleMatch, ruleIndex) =>
      this.renderRule(ruleMatch, ruleIndex)
    );
    const buttonProps = {
      className: 'uk-button-default uk-button-small',
      onClick: this.toggleHoverMode,
    };
    const toggleHoverModeButton = (
      <button {...buttonProps}>
        {this.state.hoverMode ? 'Disable hover mode' : 'Enable hover mode'}
      </button>
    );

    return (
      <ul className="MatchedStylesView">
        {rules}
        {toggleHoverModeButton}
      </ul>
    );
  }
}

export default MatchedStylesView;
