/*
 * Copyright (c) Jon Lachlan 2020
*/

describe('sendHandshake', function () {

    it.todo(
        'throws an error if \`request\` is not an instance of ' +
        'http.IncomingMessage'
    );
    
    it.todo(
        'throws an error if \`socket\` is not an instance of ' +
        'stream.Duplex'
    );
    
    it.todo(
        'throws an error if \`headers\` is not an Array'
    );
    
    it.todo(
        'throws an error if any of the \`headers\` are not well-formatted ' +
        'header strings'
    );

    it.todo(
        'successfully establishes a WebSocket connection with a client'
    );
    
    it.todo(
        'successfully establishes Sec-Websocket-Protocol with a client'
    );
    
    it.todo(
        'successfully establishes any Sec-Websocket-Extension with a client'
    );
    
});