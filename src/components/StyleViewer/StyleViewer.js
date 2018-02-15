// @flow @format
import * as React from 'react';
import SplitPane from 'react-split-pane';
import JSONTree from 'react-json-tree';
import ElementStyles from './ElementStyles';
import ComputedStylesView from './ComputedStylesView';
import MatchedStylesView from './MatchedStylesView';
import { connect } from 'react-redux';
import {
  getStyles,
  getIsPruning,
  getSelectedNodes,
  filterSelectedNodes,
} from '../../selectors';
import { pruneNode, toggleCSSProperty } from '../../actions';
import './StyleViewer.css';

import type {
  State as ReduxState,
  Dispatch,
  NodeStyleMap,
  InspectorSettings,
} from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

type Props = {
  styles: NodeStyleMap,
  isPruning: boolean,
  selectedNodes: { [CRDP$NodeId]: boolean },
  settings: InspectorSettings,

  toggleCSSProperty: CRDP$NodeId => number => number => () => void,
  pruneNode: CRDP$NodeId => void,
};

class StyleViewer extends React.Component<Props> {
  props: Props;

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
      styles,
      isPruning,
      settings,
      pruneNode,
      toggleCSSProperty,
    } = this.props;
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
    return (
      <ElementStyles
        nodeId={nodeId}
        style={nodeStyle}
        pruneNode={pruneNode}
        isPruning={isPruning}
        settings={settings}
      >
        <MatchedStylesView
          name="Matched"
          matchedStyles={matchedCSSRules}
          ruleAnnotations={ruleAnnotations}
          toggleCSSProperty={toggleCSSProperty(nodeId)}
        />
        {showDevControls && (
          <ComputedStylesView
            name="Computed"
            parentComputedStyle={parentComputedStyle}
            computedStyle={computedStyle}
          />
        )}
        {showDevControls && <JSONTree data={styles} name="JSONTree" />}
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  pruneNode: nodeId => dispatch(pruneNode(nodeId)),
  toggleCSSProperty: nodeId => ruleIdx => propIdx => () =>
    dispatch(toggleCSSProperty(nodeId, ruleIdx, propIdx)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyleViewer);
