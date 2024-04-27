/*
 * Copyright (c) Jon Lachlan 2020
*/

import stream from 'stream';
import prepareWebsocketFrame from './prepareWebsocketFrame.js';

/* 
 * May be called more than once for an endpoint
*/
export default function sendFactory (
    socket /* <stream.Duplex> */
) {

    if(
        (socket instanceof stream.Duplex) !== true
    )
        throw new Error(
            'socket argument of sendFactory is not an instance of stream.Duplex'
        );

    return function (
        frame /* <Uint8Array> */, 
    ) {
    
        if(
            (frame instanceof Uint8Array) !== true
        )
            throw new Error(
                'frame argument must be a Uint8Array'
            );
        
        socket.write(
            frame            
        );
    };
};