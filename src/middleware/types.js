// @flow
import messageTypes from './messageTypes';

export type OutgoingMessageType = $Keys<typeof messageTypes.outgoing>;
export type IncomingMessageType = $Keys<typeof messageTypes.incoming>;
