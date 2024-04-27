/*
 * Copyright (c) Jon Lachlan 2020
*/

import { createHash } from 'crypto';

export default function sendHandshake (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */,
    headers = [] /* Optional <Array> of well-formatted http header strings */
) {
        
    // Global identifier for handshake per RFC 6455
    const guid = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
    
    // Sec-WebSocket-Accept formation per RFC 6455
    const secWebsocketAccept = createHash('sha1')
        .update(
            `${request.headers['sec-websocket-key']}${guid}`
        )
        .digest('base64');
    
    // send handshake
    socket.write(
        'HTTP/1.1 101 Switching Protocol\r\n' +
        /* 
         * Per RFC 6455 Section 4.1, a "fail" should occur when Upgrade is not 
         * a case-insensitive match to "websocket"
        */ 
        'Upgrade: WebSocket\r\n' + 
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${secWebsocketAccept}\r\n` +
        headers.join('\r\n') + '\r\n'
         + '\r\n'
    );
        
}