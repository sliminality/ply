import React, { Component } from 'react';
import uuid from 'node-uuid';
import io from 'socket.io-client';
import { deleteIn } from '../utils/state';

class SocketWrapper extends Component {
  constructor(props) {
    super(props);
    this.requestDOM = this.requestDOM.bind(this);
    this.requestStyles = this.requestStyles.bind(this);

    const port = 8090;
    this.socket = io.connect(`http://localhost:${port}`);

    this.socket.on('connect', this._onSocketConnect);
    this.socket.on('server.response.DOM', this._onServerDOM);
    this.socket.on('server.response.styles', this._onServerStyles);
    this.socket.on('disconnect', this._onSocketDisconnect);

    this.state = {
      requests: {},
      socketId: io.connect(`http://localhost:${port}`),
      node: null,
      styles: null,
    };
  }

  _onSocketConnect() {
    this.setState({ socketId: this.socket.id });
    console.log(`Connected to socket: ${this.state.socketId}`);
  }

  _onServerDOM({ id, node }) {
    const requests = deleteIn(this.state.requests, id);
    this.setState({ node, requests });
    console.log(`[${id}]`, 'Server responded with node', node);
  }

  _onServerStyles({ id, styles }) {
    const requests = deleteIn(this.state.requests, id);
    this.setState({ styles, requests });
    console.log(`[${id}]`, 'Server responded with styles', styles);
  }

  _onSocketDisconnect() {
    this.setState({ socketId: null });
    console.log('Disconnected from socket');
  }

  requestDOM() {
    const id = uuid();
    const selector = 'body > main > section:nth-child(3) > div:nth-child(2) > figure';
    const requests = {
      ...this.state.requests,
      [id]: 'REQUEST_DOM',
    };
    this.setState({ requests });
    this.socket.emit('ui.request.DOM', { id, selector });
  }

  requestStyles() {
    const id = uuid();
    let nodeId;
    if (this.state.node) {
      nodeId = this.state.node.nodeId;
    } else {
      console.error('No node defined');
      return;
    }
    const requests = {
      ...this.state.requests,
      [id]: 'REQUEST_STYLES',
    };
    this.setState({ requests });
    this.socket.emit('ui.request.styles', { id, nodeId });
  }

  render() {
    return (
      <div>
        <button onClick={this.requestDOM}>Request DOM</button>
        <button onClick={this.requestStyles}>Request Styles</button>
        {this.props.children}
      </div>
    );
  }
}

export default SocketWrapper;
