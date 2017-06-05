// @flow
import React, { Component } from 'react';

type Props = {
  styles: NodeStyles,
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

    return (
      <div {...props}>
        {this.renderToolbar()}
        <div className="ElementStyles__content">
          {content}
        </div>
      </div>
    );
  }
}

export default ElementStyles;
