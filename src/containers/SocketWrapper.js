import React, { Component } from 'react';
import uuid from 'node-uuid';
import io from 'socket.io-client';
import { deleteIn } from '../utils/state';

const SELECTOR = 'body > main > section:nth-child(3) > div:nth-child(2) > figure';

class SocketWrapper extends Component {
  constructor(props) {
    super(props);
    this.requestNode = this.requestNode.bind(this);
    this.requestStyles = this.requestStyles.bind(this);
    this._onSocketConnect = this._onSocketConnect.bind(this);
    this._onServerNode = this._onServerNode.bind(this);
    this._onServerStyles = this._onServerStyles.bind(this);
    this._onServerError = this._onServerError.bind(this);
    this._onSocketDisconnect = this._onSocketDisconnect.bind(this);

    const port = 8090;
    this.socket = io.connect(`http://localhost:${port}`);

    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('server.response.node', this._onServerNode);
    this.socket.on('server.response.styles', this._onServerStyles);
    this.socket.on('server.response.error', this._onServerError);
    this.socket.on('disconnect', this._onSocketDisconnect);

    this.state = {
      requests: {},
      socketId: io.connect(`http://localhost:${port}`),
      root: null,
      styles: null,
    };
  }

  componentDidMount() {
    this.requestNode(SELECTOR);
  }

  _onSocketConnect() {
    this.setState({ socketId: this.socket.id });
    console.log(`Connected to socket: ${this.state.socketId}`);
  }

  _onServerNode({ id, node }) {
    const requests = deleteIn(this.state.requests, id);
    this.setState({ node, requests });
    console.log(`[${id}]`, 'Server responded with node:\n', node);
  }

  _onServerStyles({ id, styles }) {
    const requests = deleteIn(this.state.requests, id);
    this.setState({ styles, requests });
    console.log(`[${id}]`, 'Server responded with styles:\n', styles);
  }

  _onServerError({ id, name, message }) {
    console.log(`[${id}]`, 'Server responded with', name, message);
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
      [id]: 'REQUEST_NODE',
    };
    this.setState({ requests });
    this.socket.emit('ui.request.node', { id, selector });
  }

  requestStyles() {
    let nodeId;
    if (this.state.node) {
      nodeId = this.state.node.nodeId;
    } else {
      console.error('No node defined');
      return;
    }
    const id = uuid();
    const requests = {
      ...this.state.requests,
      [id]: 'REQUEST_STYLES',
    };
    this.setState({ requests });
    this.socket.emit('ui.request.styles', { id, nodeId });
  }

  render() {
    const childProps = {
      node: this.state.node,
      styles: this.state.styles,
    };
    return (
      <div>
        <button onClick={() => this.requestNode(SELECTOR)}>Request Node</button>
        <button onClick={this.requestStyles}>Request Styles</button>
        {React.cloneElement(this.props.children, childProps)}
      </div>
    );
  }
}

export default SocketWrapper;
