/*
 * Copyright (c) Jon Lachlan 2020
*/

import { EventEmitter } from 'events';
import { randomBytes, createHash } from 'crypto';
import getParsedWebsocketFramesFactory from './getParsedWebsocketFramesFactory.js';

describe('getParsedWebsocketFramesFactory', function () {
    
    it.skip(
        'throws an error if \`socket\` is not an instance of stream.Duplex'
    , function () {
        // not implemented
    });
    
    it(
        'returns an async generator'
    , async function () {
        
            const payload = 
                new Uint8Array(1);
            payload.fill(1);
            
            const bits = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1
            ];
            
            const frames = 
                new Uint8Array(3);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start position */,
                1 /* end position */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start position */,
                2 /* end position */
            );
            frames.set(
                payload,
                2 /* offset */
            );
        
            const reads = 
                [
                    frames
                ];
            const writes = 
                [];

            class DuplexMock extends EventEmitter {
        
                read () {
                    return reads.shift();
                }
            
                write (frames) {
                    writes.push(frames);
                }
                
            }

            const socket = 
                new DuplexMock();
            const getParsedWebsocketFrames = 
                getParsedWebsocketFramesFactory(socket);
            
            socket.emit(
                'readable'
            );
            
            // should run if getMessages is an async generator
            for await (const message of getParsedWebsocketFrames()) {
                expect(
                    message
                ).toEqual({
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(1)
                            .fill(
                                1,
                                0 /* start position */,
                                1. /* end position */
                            )
                });
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
            'yields an Object with { fin, rsv1, rsv2, rsv3, opcode, mask, payload }'
        , async function () {
        
            const payload = 
                new Uint8Array(1);
            payload.fill(2);
            
            const bits = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1
            ];
            
            const frames = 
                new Uint8Array(3);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start position */,
                1 /* end position */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start position */,
                2 /* end position */
            );
            frames.set(
                payload,
                2 /* offset */
            );
        
            const reads = 
                [
                    frames
                ];
            const writes = 
                [];

            class DuplexMock extends EventEmitter {
        
                read () {
                    return reads.shift();
                }
            
                write (frames) {
                    writes.push(frames);
                }
                
            }

            const socket = 
                new DuplexMock();
            const getParsedWebsocketFrames = 
                getParsedWebsocketFramesFactory(socket);
            
            socket.emit(
                'readable'
            );
            
            // should run if is an async generator
            for await (const message of getParsedWebsocketFrames()) {
                expect(message).toEqual({
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(1)
                            .fill(
                                2,
                                0 /* start position */,
                                1 /* end position */
                            )
                });
                // run only once
                break;
            }
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
        });

        it(
            'handles multiple messages'
        , async function ()  {
            
            const payload1 = 
                new Uint8Array(1);
            payload1.fill(1);
            
            const bits1 = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1
            ];
            
            const encoder = 
                new TextEncoder('utf-8');
            const payload2 = 
                new Uint8Array(
                    encoder.encode(
                        'test text'
                    )
                );
            const bits2 = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1
            ];
            
            const frames = 
                new Uint8Array(
                    2 + payload1.length + 2 + payload2.length
                );
            frames.fill(
                parseInt(
                    bits1.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start position */,
                1 /* end position */
            );
            frames.fill(
                parseInt(
                    bits1.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start position */,
                2 /* end position */
            );
            frames.set(
                payload1,
                2 /* offset */
            );
            frames.fill(
                parseInt(
                    bits2.slice(0, 8).join(''),
                    2 /* base */
                ),
                2 + payload1.length /* start position */,
                2 + payload1.length + 1 /* end position */
            );
            frames.fill(
                parseInt(
                    bits2.slice(8, 16).join(''),
                    2 /* base */
                ),
                2 + payload1.length + 1 /* start position */,
                2 + payload1.length + 2 /* end position */
            );
            frames.set(
                payload2,
                2 + payload1.length + 2 /* offset */
            );
        
            const reads = 
                [
                    frames
                ];
            const writes = 
                [];

            class DuplexMock extends EventEmitter {
        
                read () {
                    return reads.shift();
                }
            
                write (frames) {
                    writes.push(frames);
                }
                
            }

            const socket = 
                new DuplexMock();
            const getParsedWebsocketFrames = 
                getParsedWebsocketFramesFactory(socket);
            
            socket.emit(
                'readable'
            );
            
            const iterator = 
                getParsedWebsocketFrames();
            const message1 = 
                await iterator.next();
            expect(message1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                         new Uint8Array(1)
                            .fill(
                                1,
                                0 /* start position */,
                                1 /* end position */
                            )
                },
                done: false
            });
            
            const decoder =
                new TextDecoder('utf-8');
            const message2 = 
                await iterator.next();
            expect(
                decoder.decode(
                    message2.value.payload
                )
            ).toEqual(
                'test text'
            );
            expect(message2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x1,
                    mask: 0,
                    payload: 
                        new Uint8Array(
                            encoder.encode(
                                'test text'
                            )
                        )
                },
                done: false
            });
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
        });
        
        it(
            'responds to multiple readable events from the socket'
        , async function () {
            
            const reads = 
                [];
            const writes = 
                [];

            const payload1 = 
                new Uint8Array(1);
            payload1.fill(1);
            
            const bits1 = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1
            ];
            
            const encoder = 
                new TextEncoder('utf-8');
            const payload2 = 
                new Uint8Array(
                    encoder.encode(
                        'test text'
                    )
                );
            const bits2 = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1
            ];
            
            const frames1 = 
                new Uint8Array(
                    2 + payload1.length + 2 + payload2.length
                );
            frames1.fill(
                parseInt(
                    bits1.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start position */,
                1 /* end position */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start position */,
                2 /* end position */
            );
            frames1.set(
                payload1,
                2 /* offset */
            );
            frames1.fill(
                parseInt(
                    bits2.slice(0, 8).join(''),
                    2 /* base */
                ),
                2 + payload1.length /* start position */,
                2 + payload1.length + 1 /* end position */
            );
            frames1.fill(
                parseInt(
                    bits2.slice(8, 16).join(''),
                    2 /* base */
                ),
                2 + payload1.length + 1 /* start position */,
                2 + payload1.length + 2 /* end position */
            );
            frames1.set(
                payload2,
                2 + payload1.length + 2 /* offset */
            );
            reads.push(
                frames1
            );
            
            const payload3 = 
                new Uint8Array(1);
            payload3.fill(2);
            
            const frames2 = 
                new Uint8Array(
                    2 + payload2.length
                );
            const bits3 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1
                ];
            frames2.fill(
                parseInt(
                    bits3.slice(0, 8).join(''),
                    2 /* base */
                ),
                0 /* start position */,
                1 /* end position */
            );
            frames2.fill(
                parseInt(
                    bits3.slice(8, 16).join(''),
                    2 /* base */
                ),
                1 /* start position */,
                2 /* end position */
            );
            frames2.set(
                payload3,
                2 /* offset */
            );
            reads.push(
                frames2
            );
        
            class DuplexMock extends EventEmitter {
        
                read () {
                    return reads.shift();
                }
            
                write (frames) {
                    writes.push(frames);
                }
                
            }

            const socket = 
                new DuplexMock();
            const getParsedWebsocketFrames = 
                getParsedWebsocketFramesFactory(socket);
            
            socket.emit(
                'readable'
            );
            
            const iterator1 = 
                getParsedWebsocketFrames();
            const message1 = 
                await iterator1.next();
            expect(message1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(1)
                            .fill(
                                1,
                                0 /* start position */,
                                1 /* end position */
                            )
                },
                done: false
            });

            const decoder = 
                new TextDecoder('utf-8');
            const message2 = 
                await iterator1.next();
            expect(
                decoder.decode(
                    message2.value.payload
                )
            ).toEqual(
                'test text'
            );
            expect(message2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x1,
                    mask: 0,
                    payload: 
                        new Uint8Array(
                            encoder.encode(
                                'test text'
                            )
                        )
                },
                done: false
            });
            expect(reads.length).toEqual(1);
            expect(writes.length).toEqual(0);
            
            socket.emit(
                'readable'
            );
            
            const iterator2 = 
                getParsedWebsocketFrames();
            const message3 = 
                await iterator2.next();
            expect(message3).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: 
                        new Uint8Array(1)
                            .fill(
                                2,
                                0 /* start position */,
                                1 /* end position */
                            )
                },
                done: false
            });
            expect(reads.length).toEqual(0);
            expect(writes.length).toEqual(0);
        });
        
        it.todo(
            'waits on a slow read() from socket'
        );
        
    });
    
});