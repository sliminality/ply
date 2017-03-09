import React, { Component } from 'react';
import uuid from 'node-uuid';
import io from 'socket.io-client';
import { deleteIn } from '../utils/state';

const SELECTOR = 'body > main > section:nth-child(3) > div:nth-child(2) > figure';
// const SELECTOR = '#account_actions_logged_out_dashboard > div.about-tumblr-showcase.ready.show-login > div.showcase > div.section.login-section.active';
// const SELECTOR = '#main > ol';

class SocketWrapper extends Component {
  constructor(props) {
    super(props);
    this.flushRequests = this.flushRequests.bind(this);
    this.requestNode = this.requestNode.bind(this);
    this.requestStyles = this.requestStyles.bind(this);
    this._onSocketConnect = this._onSocketConnect.bind(this);
    this._onServerNode = this._onServerNode.bind(this);
    this._onServerStyles = this._onServerStyles.bind(this);
    this._onServerError = this._onServerError.bind(this);
    this._onSocketDisconnect = this._onSocketDisconnect.bind(this);
    this._onSocketResponse = this._onSocketResponse.bind(this);

    const port = 1111;
    this.socket = io.connect(`http://localhost:${port}/frontends`, {
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('data.res', this._onSocketResponse);
    this.socket.on('data.err', this._onSocketError);
    this.socket.on('disconnect', this._onSocketDisconnect);

    this.state = {
      requests: {},
      socketId: this.socket.id,
      root: null,
      styles: {},
    };
  }

  componentDidMount() {
    this.requestNode(SELECTOR);
  }

  _onSocketConnect() {
    this.setState({ socketId: this.socket.id });
    console.log(`Connected to socket: ${this.state.socketId}`);
  }

  _onSocketResponse(res) {
    if (res.id in this.state.requests) {
      const requests = deleteIn(this.state.requests, res.id);
      this.setState({ requests });

      switch (res.type) {
        case 'RECEIVE_NODE':
          this._onServerNode(res);
          break;
        case 'RECEIVE_STYLES':
          this._onServerStyles(res);
          break;
      }
    }
  }

  _onServerNode({ id, node }) {
    this.setState({ node });
    console.log(`[${id}]`, 'Server responded with node:\n', node);
  }

  _onServerStyles(res) {
    const { id, nodeId, inlineStyle, attributesStyle, matchedCSSRules,
      inherited, pseudoElements, cssKeyframesRules } = res;
    const styles = {
      inlineStyle, attributesStyle, matchedCSSRules,
      inherited, pseudoElements, cssKeyframesRules,
    };
    console.log(`[${id}]`, 'Server responded with styles:\n', styles);
    const newStyles = Object.assign({}, this.state.styles, {
      [nodeId]: styles,
    });
    this.setState({ styles: newStyles });
  }

  _onServerError({ id, message }) {
    console.error(`[${id}]`, 'Server responded with', message);
    const requests = deleteIn(this.state.requests, id);
    this.setState({ requests });
  }

  _onSocketDisconnect() {
    this.setState({ socketId: null });
    console.log('Disconnected from socket');
  }

  requestNode(selector) {
    const id = uuid();
    const requests = {
      ...this.state.requests,
    };
    requests[id] = 'REQUEST_NODE';
    this.setState({ requests });
    this.socket.emit('data.req', {
      id,
      type: 'REQUEST_NODE',
      selector
    });
  }

  requestStyles(nodeId) {
    const id = uuid();
    const requests = {
      ...this.state.requests,
    };
    requests[id] = 'REQUEST_STYLES';
    this.setState({ requests });
    this.socket.emit('data.req', { id, type: 'REQUEST_STYLES', nodeId });
  }

  flushRequests() {
    this.setState({ requests: {} });
  }

  render() {
    const childProps = {
      node: this.state.node,
      styles: this.state.styles,
      requestStyles: this.requestStyles,
    };
    return (
      <div>
        <button onClick={() => this.requestNode(SELECTOR)}>Request Node</button>
        <button onClick={() => this.requestStyles(this.state.node.nodeId)}>
          Request Styles
        </button>
        <button onClick={this.flushRequests}>
          Flush Pending Requests
        </button>
        {React.cloneElement(this.props.children, childProps)}
      </div>
    );
  }
}

export default SocketWrapper;
