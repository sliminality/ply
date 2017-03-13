// @flow
/* eslint-disable no-unused-expressions, no-undef */

type ComputedStyle = { [prop: string]: string };

declare type Styles = {
  nodeId: number,
  computedStyle: ComputedStyle,
  inlineStyle: CSSStyle,
  attributesStyle: CSSStyle,
  matchedCSSRules: RuleMatch[],
  inherited: Object,
  pseudoElements: Object,
  cssKeyframesRules: Object,
};
