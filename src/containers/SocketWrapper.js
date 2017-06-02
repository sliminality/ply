// @flow
import React, { Component } from 'react';
import uuid from 'uuid';
import io from 'socket.io-client';
import omit from 'lodash/omit';

const logResult = (id: number, ...rest: any[]): void =>
  console.log(`[${id}]`, ...rest);

const __SELECTORS = {
  APPLE: '#ac-globalnav',
  LOREMIPSUM: 'body > main > section:nth-child(3) > div:nth-child(2)',
};

type SocketMessage = {
  type: string,
  id: number,
};

type NodeMap = { [NodeId]: Node };

class SocketWrapper extends Component {
  socket: Object;

  state: {
    requests: Object,
    socketId: ?string,
    selector: string,
    rootNode: ?Node,
    nodes: NodeMap,
    styles: { [nodeId: NodeId]: NodeStyles },
  };

  constructor() {
    super();

    const port = 1111;
    const socketURL = `http://localhost:${port}/apps`;
    this.socket = io.connect(socketURL, {
      reconnectionAttempts: 5,
    });

    this.state = {
      requests: {},
      socketId: this.socket.id,
      rootNode: null,
      nodes: {},
      styles: {},
      selector: __SELECTORS.APPLE,
    };
  }

  componentDidMount() {
    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('data.res', this._onSocketResponse);
    this.socket.on('data.update', this._onSocketResponse);
    this.socket.on('data.err', this._onServerError);
    this.socket.on('disconnect', this._onSocketDisconnect);
  }

  componentWillUnmount() {
    this.socket.off();
  }

  _onSocketConnect = () => {
    this.setState({
      socketId: this.socket.id,
    });
    console.log('Connected to socket:', this.state.socketId);
  };

  _onSocketResponse = (res: SocketMessage) => {
    const { requests } = this.state;

    const dispatch = {
      UPDATE_DOCUMENT: this._updateDocument,
      UPDATE_ROOT: this._updateRoot,
      RECEIVE_NODE: this._updateRoot,
      RECEIVE_STYLES: this._onServerStyles,
      SERVER_ERROR: this._onServerError,
      DEFAULT: ({ id, type }) =>
        logResult(id, 'Unrecognized response type', type),
    };
    const action = dispatch[res.type] || dispatch['DEFAULT'];
    action(res);

    const nextRequests = omit(requests, res.id);
    this.setState({
      requests: nextRequests,
    });
  };

  _updateDocument = ({ nodes }) => {
    this.setState({ nodes });
  };

  _updateRoot = ({ id, nodeId, node, styles }) => {
    logResult(id, 'Server pushed new inspection root:\n', node);
    let nextState;
    if (styles) {
      // New inspection root pushed with styles.
      nextState = {
        rootNode: node,
        styles: {
          ...this.state.styles,
          [nodeId]: styles,
        }
      };
    } else {
      // No styles (legacy/testing, for now).
      nextState = { rootNode: node };
    }
    this.setState(nextState);
  };

  _onServerStyles = (res) => {
    const {
      id,
      nodeId,
      computedStyle,
      parentComputedStyle,
      inlineStyle,
      attributesStyle,
      matchedCSSRules,
      inherited,
      pseudoElements,
      cssKeyframesRules,
    } = res;

    const styles: NodeStyles = {
      nodeId,
      computedStyle,
      parentComputedStyle,
      inlineStyle,
      attributesStyle,
      matchedCSSRules,
      inherited,
      pseudoElements,
      cssKeyframesRules,
    };

    const nextStyles = Object.assign({}, this.state.styles, {
      [nodeId]: styles,
    });
    logResult(id, 'Server responded with styles:\n', styles);
    this.setState({
      styles: nextStyles,
    });
  };

  _onServerError = ({ id, message }) => {
    logResult(id, 'Server responded with error:', message);
    const nextRequests = omit(this.state.requests, id);
    this.setState({
      requests: nextRequests,
    });
  };

  _onSocketDisconnect = () => {
    this.setState({
      socketId: null,
    });
    console.log('Disconnected from socket');
  };

  requestData = (req: Object) => {
    const id = uuid();
    const requests = {
      ...this.state.requests,
      [id]: req.type,
    };
    this.setState({ requests });
    this.socket.emit('data.req', {
      id,
      ...req,
    });
  };

  flushRequests = () => {
    this.setState({
      requests: {},
    });
  };

  requestStyles = (nodeId: number): void => {
    this.requestData({
      type: 'REQUEST_STYLES',
      nodeId,
    });
  };

  requestNode = (selector: string): void => {
    this.requestData({
      type: 'REQUEST_NODE',
      selector,
    });
  };

  renderUtilsBar() {
    const buttonProps = {
      className: 'utils-bar__btn uk-button-default uk-button-small',
    };

    const onSelectorChange = (evt: Event) => {
      const { value } = evt.currentTarget;
      this.setState({ selector: value });
    };

    const requestRootNode = () => {
      this.requestNode(this.state.selector);
    };

    const onSelectorKeyDown = (evt: Event) => {
      if (evt.keyCode === 13) {
        // Enter
        requestRootNode();
      }
    };

    const requestStyles = () =>
      this.state.rootNode
        ? this.requestStyles(this.state.rootNode.nodeId)
        : null;

    return (
      <div className="utils-bar">
        <input
          className="utils-bar__input uk-input uk-form-small"
          autoFocus
          onChange={onSelectorChange}
          onKeyDown={onSelectorKeyDown}
          type="text"
          value={this.state.selector}
        />
        <button {...buttonProps} onClick={requestRootNode}>
          Request Node
        </button>
        <button {...buttonProps} onClick={requestStyles}>
          Request Styles
        </button>
        <button {...buttonProps} onClick={this.flushRequests}>
          Flush Pending Requests
        </button>
      </div>
    );
  }

  render() {
    const { rootNode, styles, nodes } = this.state;

    const utils = this.renderUtilsBar();
    const childProps = {
      rootNode,
      styles,
      nodes,
      requestStyles: this.requestStyles,
    };
    const wrappedChild = React.cloneElement(this.props.children, childProps);

    return (
      <div className="App">
        {utils}
        {wrappedChild}
      </div>
    );
  }
}

export default SocketWrapper;
