// @flow
import React, { Component } from 'react';

type Props = {
  styles: NodeStyles,
  pruneNode: NodeId => void,
  nodeId: NodeId,
  children?: React.Element<any>[],
};

class ElementStyles extends Component {
  props: Props;
  state: {
    activeView: number,
  };

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

  pruneStyles = () => {
    const { nodeId } = this.props;
    this.props.pruneNode(nodeId);
  };

  renderToolbar() {
    const { children } = this.props;
    const tabs = React.Children.map(children, (child, i) => {
      const tabProps = {
        key: i,
        className: this.state.activeView === i ? 'uk-active' : null,
        onClick: () => this.switchView(i),
      };

      return (
        <li {...tabProps}>
          <a href="#">{child.props.name}</a>
        </li>
      );
    });
    const tabsClassName = ['uk-tab', 'ElementStyles__tabs'].join(' ');

    return (
      <div className="ElementStyles__toolbar">
        <ul className={tabsClassName}>
          {tabs}
        </ul>
        <span className="ElementStyles__node-id">
          Node ID: {this.props.nodeId}
        </span>
      </div>
    );
  }

  render() {
    const { styles, nodeId } = this.props;
    let content = null;
    if (!styles) {
      content = (
        <span className="ElementStyles__loading">
          Loading styles...;
        </span>
      );
    } else {
      const currentView: number = this.state.activeView;
      content = this.props.children[currentView];
    }

    const props = {
      className: 'ElementStyles',
      key: nodeId,
    };
    const buttonProps = {
      className: 'ElementStyles__prune-btn uk-button-default uk-button-small',
      onClick: this.pruneStyles,
    };

    return (
      <div {...props}>
        {this.renderToolbar()}
        <div className="ElementStyles__content">
          {content}
        </div>
        <button {...buttonProps}>
          Prune
        </button>
      </div>
    );
  }
}

export default ElementStyles;
