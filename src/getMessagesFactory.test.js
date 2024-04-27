/*
 * Copyright (c) Jon Lachlan 2020
*/

import stream from 'stream';
import { EventEmitter } from 'events';
import getMessagesFactory from './getMessagesFactory.js';
import prepareWebsocketFrame from './prepareWebsocketFrame.js';

describe(
    'getMessagesFactory'
, function() {

    it(
        'throws an error if \`socket\` is not an instance of stream.Duplex'
    , function () {
        
        let errorsCount = 
            0;
        try {
            const getMessages1 = 
                getMessagesFactory();
        } catch (err) {
            expect(err.message).toEqual(
                'socket argument of getMessagesFactory is not an instance of stream.Duplex'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        const socket = 
            new class extends stream.Duplex {
                
                _read () {
                
                }
            };
        
        try {
            const getMessages2 = 
                getMessagesFactory(socket);
        } catch (err) {
            throw err;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
    });
    
    it(
        'returns an async generator'
    , async function () {
        
        const reads = 
            [
                prepareWebsocketFrame(
                    new Uint8Array(0)
                )
            ];
        const writes = 
            [];

        const socket = 
            new class extends stream.Duplex {
        
                _read () {
            
                }
            
                read () {
                    return reads.shift();
                }
            
                write (frames) {
                    writes.push(frames);
                }
            }
        const getMessages = 
            getMessagesFactory(socket);
        
        socket.emit('readable');
            
        // should run if getMessages is an async generator
        for await (const message of getMessages()) {
            expect(message).toEqual({
                rsv1: 0,
                rsv2: 0,
                rsv3: 0,
                opcode: 0x2,
                mask: 0,
                payload: new Uint8Array(0)
            })
            // run only once
            break;
        }
        expect(reads.length).toEqual(0);
        expect(writes.length).toEqual(0);
    });
    
    describe(
        'returned async generator'
    , function () {
        
        it(
            'yields a message if it is an unfragmented message'
        , async function () {
            
            const reads = 
                [];
            const writes = 
                [];
            
            const frame =
                new Uint8Array(12);
            frame.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(1)
                )
            );
            reads.push(
                frame
            );

            const socket = 
                new class extends stream.Duplex {
        
                    _read () {
            
                    }
            
                    read () {
                        return reads.shift();
                    }
            
                    write (frames) {
                        writes.push(frames);
                    }
                }
            const getMessages = 
                getMessagesFactory(socket);
        
            socket.emit('readable');
            
            const iterator = 
                getMessages();
            const message = 
                await iterator.next();
            expect(message).toEqual({
                value: {
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(10).fill(1)
                }, 
                done: false
            });
            expect(reads.length).toEqual(0);    
            expect(writes.length).toEqual(0);        
        });
        
        /*
         * Tests for stream or iterator on payload
        */
        
        it.todo(
            'makes a payload chunk available on a partial frame if partial frame ' +
            'includes a portion of a non-empty payload'
        );
        
        it.todo(
            'yields a message if it is an initial frame of a fragmented message'
        );
        
        it.todo(
            'makes a payload chunk available on a fragmented message if a ' + 
            'continuation frame with a non-empty payload is given'
        );
        
        it.todo(
            'yields a message if it is an unfragmented control frame when a ' + 
            'fragmented message is pending'
        );
        
        it.todo(
            'throws an error if an unfragmented non-control frame is given when a ' + 
            'fragmented message is pending'
        );
        
        /* 
         * ^
        */
        
        it(
            'throws an error if more than one initial message fragment is sent ' + 
            'without closing the fragmented message'
        , async function () {
            
            const reads = 
                [];
            const writes = 
                [];
            
            // correct fragmented message
            
            const frames1 =
                new Uint8Array(36);
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(1),
                    {
                        fin: 0
                    }
                ),
                0 /* offset */
            );
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(2),
                    {
                        fin: 0,
                        opcode: 0x0
                    }
                ),
                12 /* offset */
            );
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(3),
                    {
                        fin: 1,
                        opcode: 0x0
                    }
                ),
                24 /* offset */
            );
            reads.push(
                frames1
            );

            const socket = 
                new class extends stream.Duplex {
        
                    _read () {
            
                    }
            
                    read () {
                        return reads.shift();
                    }
            
                    write (frames) {
                        writes.push(frames);
                    }
                }
            const getMessages = 
                getMessagesFactory(socket);
        
            socket.emit('readable');
            
            const iterator1 = 
                getMessages();
            const message1 = 
                await iterator1.next();
            expect(message1).toEqual({
                value: {
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(30)
                            .fill(
                                1,
                                0 /* start position */,
                                10 /* end position */
                            )
                            .fill(
                                2,
                                10 /* start position */,
                                20 /* end position */
                            )
                            .fill(
                                3,
                                20 /* start position */,
                                30 /* end position */
                            )
                }, 
                done: false
            });
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
            
            // invalid fragmented message; second frame has opcode for binary frame
            
            const frames2 =
                new Uint8Array(36);
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(1),
                    {
                        fin: 0
                    }
                )
            );
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(2),
                    {
                        fin: 0,
                        opcode: 0x2
                    }
                ),
                12 /* offset */
            );
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(3),
                    {
                        fin: 1,
                        opcode: 0x0
                    }
                ),
                24 /* offset */
            );
            reads.push(
                frames2
            );
            
            socket.emit('readable');

            let errorsCount = 
                0;
            try {
                const message2 = 
                    await iterator1.next();
            } catch (error) {
                expect(error.message).toEqual(
                    'initial message fragment while fragmented message already pending'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
            errorsCount =
                0;
            
            // invalid fragmented message; second frame has opcode for text frame
            
            const encoder = 
                new TextEncoder('utf-8');

            const frames3 =
                new Uint8Array(48);
            frames3.set(
                prepareWebsocketFrame(
                    new Uint8Array(
                        encoder.encode(
                            'test text'
                        )
                    ),
                    {
                        fin: 0,
                        opcode: 0x1
                    }
                )
            );
            frames3.set(
                prepareWebsocketFrame(                
                    new Uint8Array(
                        encoder.encode(
                            'more test text'
                        )
                    ),
                    {
                        fin: 0,
                        opcode: 0x1
                    }
                ),
                11 /* offset */
            );
            frames3.set(
                prepareWebsocketFrame(
                    new Uint8Array(
                        encoder.encode(
                            'even more test text'
                        )
                    ),
                    {
                        fin: 1,
                        opcode: 0x0
                    }
                ),
                26 /* offset */
            );
            reads.push(
                frames3
            );
            
            socket.emit('readable');

            const iterator2 =
                getMessages();
            try {
                const message3 = 
                    await iterator2.next();
            } catch (error) {
                expect(error.message).toEqual(
                    'initial message fragment while fragmented message already pending'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
        });
        
        it(
            'throws an error if a continuation frame is sent before an initial ' + 
            'fragment is sent'
        , async function () {
            
            const reads = 
                [];
            const writes = 
                [];
            
            // correct fragmented message
            
            const frames1 =
                new Uint8Array(36);
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(1),
                    {
                        fin: 0
                    }
                ),
                0 /* offset */
            );
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(2),
                    {
                        fin: 0,
                        opcode: 0x0
                    }
                ),
                12 /* offset */
            );
            frames1.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(3),
                    {
                        fin: 1,
                        opcode: 0x0
                    }
                ),
                24 /* offset */
            );
            reads.push(
                frames1
            );

            const socket = 
                new class extends stream.Duplex {
        
                    _read () {
            
                    }
            
                    read () {
                        return reads.shift();
                    }
            
                    write (frames) {
                        writes.push(frames);
                    }
                }
            const getMessages = 
                getMessagesFactory(socket);
        
            socket.emit('readable');
            
            const iterator = 
                getMessages();
            const message1 = 
                await iterator.next();
            expect(message1).toEqual({
                value: {
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(30)
                            .fill(
                                1,
                                0 /* start position */,
                                10 /* end position */
                            )
                            .fill(
                                2,
                                10 /* start position */,
                                20 /* end position */
                            )
                            .fill(
                                3,
                                20 /* start position */,
                                30 /* end position */
                            )
                }, 
                done: false
            });
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
            
            // invalid fragmented message; first frame has opcode for continuation frame
            
             const frames2 =
                new Uint8Array(36);
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(1),
                    {
                        fin: 0,
                        opcode: 0x0
                    }
                ),
                0 /* offset */
            );
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(2),
                    {
                        fin: 0
                    }
                ),
                12 /* offset */
            );
            frames2.set(
                prepareWebsocketFrame(
                    new Uint8Array(10).fill(3),
                    {
                        fin: 1,
                        opcode: 0x0
                    }
                ),
                24 /* offset */
            );
            reads.push(
                frames2
            );
            
            socket.emit('readable');
            
            let errorsCount =
                0;
                
            try {
                const message2 = 
                    await iterator.next();
            } catch (error) {
                expect(error.message).toEqual(
                    'continuation frame without initial message fragment'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
        });
        
        it.todo(
            'throws an error if fragmentedMessage.isStarted() does not return a Boolean'
        );

    });
    
});