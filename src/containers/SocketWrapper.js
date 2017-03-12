// @flow
import React, { Component } from 'react';
import uuid from 'node-uuid';
import io from 'socket.io-client';
import { deleteIn } from '../utils/state';

const SELECTOR =
  // 'body > main > section:nth-child(3) > div:nth-child(2) > figure';
  'body > main > section:nth-child(3) > div:nth-child(2)';
  // '#account_actions_logged_out_dashboard > div.about-tumblr-showcase.ready.show-login > div.showcase > div.section.login-section.active';
  // '#main > ol';

const logResult = (id: number, ...rest: any[]): void =>
  console.log(`[${id}]`, ...rest);

class SocketWrapper extends Component {
  constructor(props) {
    super(props);
    this.flushRequests = this.flushRequests.bind(this);
    this.requestNode = this.requestNode.bind(this);
    this.requestStyles = this.requestStyles.bind(this);
    this.requestData = this.requestData.bind(this);
    this._onSocketConnect = this._onSocketConnect.bind(this);
    this._onServerNode = this._onServerNode.bind(this);
    this._onServerStyles = this._onServerStyles.bind(this);
    this._onServerError = this._onServerError.bind(this);
    this._onSocketDisconnect = this._onSocketDisconnect.bind(this);
    this._onSocketResponse = this._onSocketResponse.bind(this);

    const port = 1111;
    const socketURL = `http://localhost:${port}/frontends`;
    this.socket = io.connect(socketURL, {
      reconnectionAttempts: 5,
    });

    this.state = {
      requests: {},
      socketId: this.socket.id,
      rootNode: null,
      styles: {},
    };
  }

  componentDidMount() {
    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('data.res', this._onSocketResponse);
    this.socket.on('data.err', this._onSocketError);
    this.socket.on('disconnect', this._onSocketDisconnect);
    this.requestNode(SELECTOR);
  }

  componentWillUnmount() {
    this.socket.off();
  }

  _onSocketConnect() {
    this.setState({
      socketId: this.socket.id
    });
    console.log('Connected to socket:', this.state.socketId);
  }

  _onSocketResponse(res) {
    const { requests } = this.state;
    if (!requests[res.id]) {
      return;
    }
    const dispatch = {
      'RECEIVE_NODE': this._onServerNode,
      'RECEIVE_STYLES': this._onServerStyles,
      'DEFAULT': ({ id, type }) =>
        logResult(id, 'Unrecognized response type', type),
    };
    const action = dispatch[res.type] || dispatch['DEFAULT'];
    action(res);

    const nextRequests = deleteIn(requests, res.id);
    this.setState({
      requests: nextRequests,
    });
  }

  _onServerNode({ id, node }) {
    logResult(id, 'Server responded with node:\n', node);
    this.setState({
      rootNode: node
    });
  }

  _onServerStyles(res) {
    const { id, nodeId,
      inlineStyle, attributesStyle, matchedCSSRules,
      inherited, pseudoElements, cssKeyframesRules } = res;

    const styles = {
      inlineStyle, attributesStyle, matchedCSSRules,
      inherited, pseudoElements, cssKeyframesRules,
    };

    const nextStyles = Object.assign({},
      this.state.styles,
      { [nodeId]: styles },
    );
    logResult(id, 'Server responded with styles:\n', styles);
    this.setState({
      styles: nextStyles
    });
  }

  _onServerError({ id, message }) {
    logResult(id, 'Server responded with error:', message);
    const nextRequests = deleteIn(this.state.requests, id);
    this.setState({
      requests: nextRequests
    });
  }

  _onSocketDisconnect() {
    this.setState({
      socketId: null,
    });
    console.log('Disconnected from socket');
  }

  requestData(req) {
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
  }

  flushRequests() {
    this.setState({
      requests: {}
    });
  }

  requestStyles(nodeId: number): void {
    this.requestData({
      type: 'REQUEST_STYLES',
      nodeId,
    });
  }

  requestNode(selector: string): void {
    this.requestData({
      type: 'REQUEST_NODE',
      selector,
    });
  }

  render() {
    const { rootNode, styles } = this.state;

    const requestRootNode = () =>
      this.requestNode(SELECTOR);
    const requestStyles = () =>
      this.requestStyles(this.state.rootNode.nodeId);

    const buttonProps = {
      className: 'uk-button-default uk-button-small',
    };

    const utils =
      <div className="utils-bar">
        <button {...buttonProps}
                onClick={requestRootNode}
        >
          Request Node
        </button>
        <button {...buttonProps}
                onClick={requestStyles}
        >
          Request Styles
        </button>
        <button {...buttonProps}
                onClick={this.flushRequests}
        >
          Flush Pending Requests
        </button>
      </div>;

    const childProps = {
      rootNode,
      styles,
      requestData: this.requestData,
    };
    const wrappedChild =
      React.cloneElement(this.props.children, childProps);

    return (
      <div className="App">
        {utils}
        {wrappedChild}
      </div>
    );
  }
}

export default SocketWrapper;
