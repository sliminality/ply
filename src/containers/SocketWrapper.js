import React, { Component } from 'react';
import uuid from 'uuid';
import io from 'socket.io-client';
import { deleteIn } from '../utils/state';

const logResult = (id: string, ...rest: any[]): void =>
  console.log(`[${id}]`, ...rest);

type SocketServerError = { id: string, type: 'SERVER_ERROR', message: string };
type SocketReceiveStyles = { id: string, type: 'RECEIVE_STYLES' } & NodeStyles;
type SocketReceiveNode = { id: string, type: 'RECEIVE_NODE', node: Node };
type SocketRequestNode = { id: string, type: 'REQUEST_NODE', nodeId: NodeId };
type SocketRequestStyles = {
  id: string,
  type: 'REQUEST_STYLES',
  selector: string,
};

type SocketMessage =
  | SocketServerError
  | SocketRequestStyles
  | SocketRequestNode
  | SocketReceiveNode
  | SocketReceiveStyles;

class SocketWrapper extends Component {
  socket: Object;

  state: {
    requests: Object,
    socketId: ?string,
    selector: string,
    rootNode: ?Node,
    styles: { [nodeId: NodeId]: NodeStyles },
  };

  constructor(props) {
    super(props);

    const port = 1111;
    const socketURL = `http://localhost:${port}/apps`;
    this.socket = io.connect(socketURL, {
      reconnectionAttempts: 5,
    });

    this.state = {
      requests: {},
      socketId: this.socket.id,
      rootNode: null,
      styles: {},
      selector: 'body > main > section:nth-child(3) > div:nth-child(2)',
    };
  }

  componentDidMount() {
    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('data.res', this._onSocketResponse);
    this.socket.on('data.err', this._onSocketError);
    this.socket.on('disconnect', this._onSocketDisconnect);
    this.requestNode(this.state.selector);
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
    if (!requests[res.id]) {
      return;
    }
    const dispatch = {
      RECEIVE_NODE: this._onServerNode,
      RECEIVE_STYLES: this._onServerStyles,
      SERVER_ERROR: this._onServerError,
      DEFAULT: ({ id, type }) =>
        logResult(id, 'Unrecognized response type', type),
    };
    const action = dispatch[res.type] || dispatch['DEFAULT'];
    action(res);

    const nextRequests = deleteIn(requests, res.id);
    this.setState({
      requests: nextRequests,
    });
  };

  _onServerNode = ({ id, node }: SocketReceiveNode) => {
    logResult(id, 'Server responded with node:\n', node);
    this.setState({
      rootNode: node,
    });
  };

  _onServerStyles = (res: SocketReceiveStyles) => {
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

  _onServerError = ({ id, message }: SocketServerError) => {
    logResult(id, 'Server responded with error:', message);
    const nextRequests = deleteIn(this.state.requests, id);
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
    const { rootNode, styles } = this.state;

    const utils = this.renderUtilsBar();
    const childProps = {
      rootNode,
      styles,
      requestData: this.requestData,
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
