// @flow @format
import * as React from 'react';
import { css, StyleSheet } from 'aphrodite';
import { connect } from 'react-redux';
import { getEffectiveValueForProperty } from '../../styleHelpers';

import SplitPane from 'react-split-pane';
import JSONTree from 'react-json-tree';
import ElementStyles from './ElementStyles';
import ComputedStylesView from './ComputedStylesView';
import MatchedStylesView from './MatchedStylesView';
import { colors } from '../../styles';

import {
  getStyles,
  getCSSProperty,
  getPruned,
  getIsPruning,
  getSelectedNodes,
  getDependencies,
  filterSelectedNodes,
} from '../../selectors';
import {
  pruneNode,
  toggleCSSProperty,
  highlightNode,
  clearHighlight,
  computeDependencies,
} from '../../actions';
import { indicesEqual, toInt } from '../../styleHelpers';
import './StyleViewer.css';

import type {
  State as ReduxState,
  Dispatch,
  NodeStyleMap,
  NodeStyleMaskMap,
  InspectorSettings,
  NodeStyleDependencies,
  CSSPropertyIndices,
  CSSPropertyRelation,
  NodeStyle,
} from '../../types';
import type { CRDP$CSSProperty } from 'devtools-typed/domain/CSS';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

type Props = {
  styles: NodeStyleMap,
  isPruning: boolean,
  selectedNodes: { [CRDP$NodeId]: boolean },
  pruned: NodeStyleMaskMap,
  dependencies: NodeStyleDependencies,
  settings: InspectorSettings,

  getCSSProperty: (CRDP$NodeId, number, number) => ?CRDP$CSSProperty,

  toggleCSSProperty: CRDP$NodeId => number => number => () => void,
  highlightSelectorAll: CRDP$NodeId => string => void,
  pruneNode: CRDP$NodeId => void,
  clearHighlight: () => void,
  computeDependencies: (CRDP$NodeId, number, number) => void,
};

type State = {
  focusedProperty: ?CSSPropertyIndices,
};

class StyleViewer extends React.Component<Props, State> {
  props: Props;
  state: State = {
    focusedProperty: null,
  };

  toggleFocusedProperty = (nodeId: CRDP$NodeId) => (ruleIndex: number) => (
    propertyIndex: number,
  ) => {
    const { dependencies, computeDependencies } = this.props;
    const { focusedProperty: current } = this.state;
    const given: CSSPropertyIndices = [toInt(nodeId), ruleIndex, propertyIndex];

    // Set given property as the new focus, unless it matches the current,
    // in which case we disable the current focus.
    const nextFocus = current && indicesEqual(current)(given) ? null : given;

    this.setState({ focusedProperty: nextFocus });

    // If we don't already have dependencies, request those.
    if (nextFocus && !dependencies[nextFocus]) {
      computeDependencies(...nextFocus);
    }
  };

  getRelation = (nodeId: CRDP$NodeId) => (ruleIndex: number) => (
    propertyIndex: number,
  ): ?CSSPropertyRelation => {
    const { focusedProperty } = this.state;
    const { dependencies, getCSSProperty } = this.props;
    const given: CSSPropertyIndices = [toInt(nodeId), ruleIndex, propertyIndex];

    if (!focusedProperty || !dependencies[focusedProperty]) {
      return null;
    }
    if (indicesEqual(given)(focusedProperty)) {
      return 'FOCUSED';
    }

    const deps: Array<CSSPropertyIndices> = dependencies[focusedProperty];
    if (deps.find(indicesEqual(given))) {
      // Given property is a dependant of focused property.
      // If the keystone is disabled, we show dependants as disabled, too.
      const focused = getCSSProperty(...focusedProperty);
      console.assert(!!focused, 'focused property exists');
      return focused && focused.disabled ? 'DEPENDANT_DISABLED' : 'DEPENDANT';
    }
  };

  getEffectiveValue = (
    nodeId: CRDP$NodeId,
    nodeStyles: NodeStyle,
    property: string,
  ) => {
    // TODO: Memoize this.
    const ruleMatch = nodeStyles.matchedCSSRules;
    const result = getEffectiveValueForProperty(nodeId, ruleMatch)(property);
    const [firstMatch] = result;
    console.log(firstMatch);
    this.setState({ focusedProperty: firstMatch });
  };

  /**
   * Reduce an array of <ComputedStylesView /> components into a
   * tree of <SplitPane /> components.
   */
  renderSplits(selectedStyles: Array<React.Node>) {
    /**
     * To make all the panes evenly sized, compute
     * the size of the top pane in the current frame
     * as (100% / (TOTAL_NODES - NODES_PROCESSED).
     */
    const numStyles = selectedStyles.length;
    const reducer = (
      prev: React.Node,
      current: React.Node,
      i: number,
    ): React.Element<typeof SplitPane> => {
      return (
        <SplitPane
          split="horizontal"
          minSize={50}
          defaultSize={`${100 / (numStyles - i)}%`}
        >
          {current}
          {prev}
        </SplitPane>
      );
    };
    return selectedStyles.reduceRight(reducer);
  }

  renderNodeStyle = (nodeId: CRDP$NodeId): React.Element<any> => {
    const {
      getCSSProperty,
      styles,
      isPruning,
      pruned,
      settings,
      pruneNode,
      toggleCSSProperty,
      highlightSelectorAll,
      clearHighlight,
    } = this.props;
    const { focusedProperty } = this.state;

    const nodeStyle = styles[nodeId];
    if (!nodeStyle) {
      // Styles haven't landed yet for this particular node.
      return <span>Loading styles...</span>;
    }

    const { showDevControls } = settings;
    const {
      parentComputedStyle,
      computedStyle,
      matchedCSSRules,
      ruleAnnotations,
    } = nodeStyle;
    const mask = pruned[nodeId];

    return (
      <ElementStyles
        nodeId={nodeId}
        style={nodeStyle}
        pruneNode={pruneNode}
        mask={mask}
        isPruning={isPruning}
        settings={settings}
      >
        <MatchedStylesView
          name="Matched"
          nodeId={nodeId}
          focusedProperty={
            focusedProperty && getCSSProperty(...focusedProperty)
          }
          matchedStyles={matchedCSSRules}
          ruleAnnotations={ruleAnnotations}
          mask={mask}
          getEffectiveValue={property =>
            this.getEffectiveValue(nodeId, nodeStyle, property)}
          getCSSProperty={getCSSProperty}
          highlightSelectorAll={highlightSelectorAll(nodeId)}
          clearHighlight={clearHighlight}
          toggleCSSProperty={toggleCSSProperty(nodeId)}
          toggleFocusedProperty={this.toggleFocusedProperty(nodeId)}
          getRelation={this.getRelation(nodeId)}
        />
        <ComputedStylesView
          name="Computed"
          parentComputedStyle={parentComputedStyle}
          computedStyle={computedStyle}
        />
        {showDevControls && <JSONTree data={styles[nodeId]} name="JSON" />}
      </ElementStyles>
    );
  };

  render() {
    const { selectedNodes, settings } = this.props;
    const selected = filterSelectedNodes(selectedNodes);
    const { inspectMultiple } = settings;
    const stylesToRender = inspectMultiple ? selected : selected.slice(0, 1);
    return (
      <div className="StyleViewer">
        {stylesToRender.length > 0 ? (
          this.renderSplits(stylesToRender.map(this.renderNodeStyle))
        ) : (
          <span className="StyleViewer__none-selected">No nodes selected.</span>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: ReduxState) => ({
  styles: getStyles(state),
  selectedNodes: getSelectedNodes(state),
  isPruning: getIsPruning(state),
  pruned: getPruned(state),
  dependencies: getDependencies(state),
  getCSSProperty: getCSSProperty(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  pruneNode: nodeId => dispatch(pruneNode(nodeId)),
  highlightSelectorAll: nodeId => selectorList =>
    dispatch(highlightNode(nodeId, selectorList)),
  toggleCSSProperty: nodeId => ruleIdx => propIdx => () =>
    dispatch(toggleCSSProperty(nodeId, ruleIdx, propIdx)),
  clearHighlight: () => dispatch(clearHighlight()),
  computeDependencies: (nodeId, ruleIndex, propertyIndex) =>
    dispatch(computeDependencies(nodeId, ruleIndex, propertyIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyleViewer);
