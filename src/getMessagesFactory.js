/*
 * Copyright (c) Jon Lachlan 2020
*/

import stream from 'stream';
import getParsedWebsocketFramesFactory from './getParsedWebsocketFramesFactory.js';
import FragmentedMessageStore from './FragmentedMessageStore.js';

/* 
 * Handles fragmented messages in-memory.
 *
 * Would not yield on large or infinitely-sized messages.
*/
export default function getMessagesFactory (
    socket /* <stream.Duplex> */,
    {
        maxSize /* Integer <Number> */
    } = {}
) {

    if((socket instanceof stream.Duplex) !== true)
        throw new Error(
            'socket argument of getMessagesFactory is not an instance of stream.Duplex'
        );
    
    const getParsedWebsocketFrames = 
        getParsedWebsocketFramesFactory(
            socket
        );
    
    const fragmentedMessage = 
        new FragmentedMessageStore();
        
    return async function* (maxSize) {
        
        for await (
            const 
                {
                    payload,
                    fin,
                    rsv1,
                    rsv2,
                    rsv3,
                    opcode,
                    mask
                } 
            of getParsedWebsocketFrames(maxSize)
        ) {
            if(
                fin === 1
                &&
                opcode !== 0x0
            ) {
                // Unfragmented message
                yield {
                    payload /* <Uint8Array> */,
                    opcode /* Integer <Number> from 0 to 15 */,
                    rsv1 /* Integer <Number> from 0 to 1 */,
                    rsv2 /* Integer <Number> from 0 to 1 */,
                    rsv3 /* Integer <Number> from 0 to 1 */,
                    mask /* Integer <Number> from 0 to 1 */
                };
            } else {
                
                switch(fragmentedMessage.isStarted()) {
                
                    case true:
                        if(
                            opcode === 0x0
                        ) {
                            if(
                                fin === 1
                            ) {
                                // Final frame for fragmented message
                                fragmentedMessage.addPayload(
                                    payload
                                );
                                yield fragmentedMessage.finish();
                            } else {
                                // Continuation frame for fragmented message
                                fragmentedMessage.addPayload(
                                    payload
                                );
                            }                            
                        } else {
                            throw new Error(
                                'initial message fragment while fragmented message already pending'
                            );
                        }
                        
                        break;
                    
                    case false:
                        if(
                            opcode !== 0x0
                        ) {
                            // First frame for fragmented message
                            fragmentedMessage.start({
                                rsv1,
                                rsv2,
                                rsv3,
                                opcode,
                                mask,
                                payload
                            });
                        } else {
                            throw new Error(
                                'continuation frame without initial message fragment'
                            );
                        }
                        
                        break;
                    
                    default:
                        throw new Error(
                            'invalid value for fragment.isStarted()'
                        );
                        break;
                        
                }   
            }
        }
    };
}