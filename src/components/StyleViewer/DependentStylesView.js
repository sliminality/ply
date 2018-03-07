// @flow @format
import * as React from 'react';

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
  toggleCSSProperty: (ruleIdx: number) => (propIdx: number) => () => void,
};

class DependentStylesView extends React.Component<Props> {
  props: Props;

  render() {
    return <h1>Hello</h1>;
  }
}

export default DependentStylesView;
