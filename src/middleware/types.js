// @flow
import messageTypes from './messageTypes';

export type SocketIOMessageType = $Keys<typeof messageTypes.outgoing>;
export type OutgoingMessageType = $Keys<typeof messageTypes.outgoing>;
export type IncomingMessageType = $Keys<typeof messageTypes.incoming>;
