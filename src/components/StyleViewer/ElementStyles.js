// @flow
import * as React from 'react';
import type { NodeStyle } from '../../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

type Props = {
  nodeId: CRDP$NodeId,
  style: NodeStyle,
  pruneNode: CRDP$NodeId => void,
  children?: Array<React.Node>,
};

type State = {
  activeView: number,
};

class ElementStyles extends React.Component<Props, State> {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      activeView: 0,
    };
  }

  switchView = (index: number) => {
    this.setState({
      activeView: index,
    });
  };

  renderToolbar() {
    const { children } = this.props;
    const { activeView } = this.state;
    const tabs = React.Children.map(children, (child, i) => (
      <li
        key={i}
        className={activeView === i && 'uk-active'}
        onClick={() => this.switchView(i)}
      >
        <a href="#">{child.props.name}</a>
      </li>
    ));
    return (
      <div className="ElementStyles__toolbar">
        <ul className="uk-tab ElementStyles__tabs">{tabs}</ul>
        <span className="ElementStyles__node-id">
          Node ID: {this.props.nodeId}
        </span>
      </div>
    );
  }

  render() {
    const { style, nodeId, children, pruneNode } = this.props;
    const { activeView } = this.state;
    return (
      <div className="ElementStyles" key={nodeId}>
        {this.renderToolbar()}
        <div className="ElementStyles__content">
          {!style && (
            <span className="ElementStyles__loading">Loading styles...;</span>
          )}
          {children && children[activeView]}
        </div>
        <button
          className="ElementStyles__prune-btn uk-button-default uk-button-small"
          onClick={() => pruneNode(nodeId)}
        >
          Prune
        </button>
      </div>
    );
  }
}

export default ElementStyles;
