// @flow @format
import messageTypes from './messageTypes';

export type SocketIOMessage = $Keys<typeof messageTypes.outgoing>;
export type OutgoingMessage = $Keys<typeof messageTypes.outgoing>;
export type IncomingMessage = $Keys<typeof messageTypes.incoming>;
