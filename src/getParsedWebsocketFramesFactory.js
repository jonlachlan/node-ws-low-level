/*
 * Copyright (c) Jon Lachlan 2020
*/

import parseWebsocketFramesFactory from './parseWebsocketFramesFactory.js';
import AwaitQueue from './AwaitQueue.js';

export default function getParsedWebsocketFramesFactory (
    socket /* <stream.Duplex> */,
    /* Optional options object */
    {
        /*
         * Optional <Integer> of max in-memory message store size, in bytes. This is not enforced
         * on small messages, which do not necessarily make use of one of the in-memory store
         * (PartialFrameStore).
        */
        maxInMemoryStoreSize
    } = {}
) {

    const parseMore = 
        parseWebsocketFramesFactory(
            {
                maxInMemoryStoreSize
            }
        );
    
    /*
     * Queue system
    */
    
    /* 
     * parserQueue returns a Promise on shift() that resolves an iterable of 
     * parsed websocket frames
    */
    const parserQueue = 
        new AwaitQueue();
        
    const readableQueue =
        new AwaitQueue();
    
    (async function () {
        while(true) {
            parserQueue.push(
                parseMore(
                    (
                        await readableQueue.shift()
                    )()
                )
            );
        }
    })();

    // Hook-in to the nodejs event emitter
    socket.on(
        'readable', 
        function() {
            readableQueue.push(
                () => this.read()
            );
        }
    );
    
    return async function* () {
        
        while(true) {
                
            for await (const frame of (await parserQueue.shift())) {
                yield frame;
            }            
        }
    }
}