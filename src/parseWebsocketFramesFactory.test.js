/*
 * Copyright (c) Jon Lachlan 2020
*/

import parseWebsocketFramesFactory from './parseWebsocketFramesFactory.js';
import prepareWebsocketFrame from './prepareWebsocketFrame.js';

describe('getParsedWebsocketFramesFactory', function() {
    
    it(
        'returns an async generator \`parseMore\`'
    , async function () {
        const parseMore = 
            parseWebsocketFramesFactory();
        
        // should run if parseMore is an async generator
        for await (const frame of parseMore(new Uint8Array(0))) {
            // ignore
        }
        expect(parseMore.name).toEqual('parseMore');
    });
    
    describe('returned async generator \`parseMore\`', function () {

        it(
            'returns when \`buffer\` is null'
        , async function () {
        
            const parseMore = 
                parseWebsocketFramesFactory();

            const iterator = 
                parseMore(null);
            const return1 = 
                await iterator.next();
            expect(return1).toEqual({
                value: undefined,
                done: true
            });
        });

        // not implemented
        it.skip(
            'throws an error when \`messagesUint8\` is not an instanceof ' + 
            '<Uint8Array> or <Buffer>'
        , async function () {
            
            const parseMore = 
                parseWebsocketFramesFactory();
            
            let errorsCount = 
                0;
                
            try {
                const iterator = 
                    parseMore(
                        // invalid argument
                        [1]
                    );
                await iterator.next();
            } catch (error) {
                expect(error.message).toEqual(
                    'buffer argument is not an instance of Uint8Array or null'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'uses the value of payload-len when payload-len is less than 126'
        , async function() {
        
            const parseMore = 
                parseWebsocketFramesFactory();
            
            // without masking
            
            const payload = 
                new Uint8Array(125);
            payload.fill(1);
            
            const bits1 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,0,1,1,1,1,1,0,1
                ];
            
            const frames1 = 
                new Uint8Array(127);
            frames1.fill(
                parseInt(
                    bits1.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames1.set(
                payload,
                2 /* offset */
            );
            
            const iterator1 = 
                parseMore(frames1);
            const parsedFrame = 
                await iterator1.next();
            expect(parsedFrame).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload
                },
                done: false
            });
            const return1 = 
                await iterator1.next();
            expect(return1).toEqual({
                value: undefined,
                done: true
            });
            
            // with masking
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(125);
            maskedPayload.fill(1);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        maskedPayload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits2 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,1,1,1,1,1,1,0,1
                ];
            
            const frames2 = 
                new Uint8Array(131);
            frames2.fill(
                parseInt(
                    bits2.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames2.set(
                maskingKey,
                2 /* offset */
            );
            frames2.set(
                maskedPayload,
                6 /* offset */
            );
            
            const iterator2 = 
                parseMore(frames2);
            const parsedFrame2 = 
                await iterator2.next();
            expect(parsedFrame2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: new Uint8Array(125).fill(1)
                },
                done: false
            });
            const return2 = 
                await iterator2.next();
            expect(return2).toEqual({
                value: undefined,
                done: true
            });
            
        });
        
        it(
            'reads extended-payload-length-16 when payload-len is 126'
        , async function() {
        
            const parseMore = 
                parseWebsocketFramesFactory();

            // without masking
            const payload = 
                new Uint8Array(126);
            payload.fill(1);
            
            const bits1 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |   extended-payload-length-16  |
                   |I|S|S|S|       |A|             |                               |
                   |N|V|V|V|       |S|             |                               |
                   | |1|2|3|       |K|             |                               |
                */
                    1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0             
                ];
            
            const frames1 = 
                new Uint8Array(130);
            frames1.fill(
                parseInt(
                    bits1.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(16, 24).join(''),
                    2 /* base */
                ),
                2 /* start */,
                3 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(24, 32).join(''),
                    2 /* bits */
                ),
                3 /* start */,
                4 /* end */
            );
            frames1.set(
                payload,
                4 /* offset */
            );

            const iterator1 = 
                parseMore(frames1);
            const parsedFrame1 = 
                await iterator1.next();
            expect(parsedFrame1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload
                },
                done: false
            });
            const return1 = 
                await iterator1.next();
            expect(return1).toEqual({
                value: undefined,
                done: true
            });
            
            // with masking
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(126);
            maskedPayload.fill(1);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        maskedPayload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits2 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |   extended-payload-length-16  |
                   |I|S|S|S|       |A|             |                               |
                   |N|V|V|V|       |S|             |                               |
                   | |1|2|3|       |K|             |                               |
                */
                    1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0             
                ];
            
            const frames2 = 
                new Uint8Array(134);
            frames2.fill(
                parseInt(
                    bits2.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(16, 24).join(''),
                    2 /* base */
                ),
                2 /* start */,
                3 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(24, 32).join(''),
                    2 /* bits */
                ),
                3 /* start */,
                4 /* end */
            );
            frames2.set(
                maskingKey,
                4 /* offset */
            );
            frames2.set(
                maskedPayload,
                8 /* offset */
            );

            const iterator2 = 
                parseMore(frames2);
            const parsedFrame2 = 
                await iterator2.next();
            expect(parsedFrame2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: new Uint8Array(126).fill(1)
                },
                done: false
            });
            const return2 = 
                await iterator2.next();
            expect(return2).toEqual({
                value: undefined,
                done: true
            });
        });
    
         it(
            'reads extended-payload-length-63 when payload-len is 127'
        , async function() {
            
            const parseMore = 
                parseWebsocketFramesFactory();

            // without masking
            
            const payload = 
                new Uint8Array(65536);
            payload.fill(1);
            
            const bits1 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |   extended-payload-length-63  |
                   |I|S|S|S|       |A|             |                               |
                   |N|V|V|V|       |S|             |                               |
                   | |1|2|3|       |K|             |                               |
                   +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
                */
                    1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                /*
                   |              extended-payload-length-63 continued             |
                   + - - - - - - - - - - - - - - - +-------------------------------+
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                /*
                   |                               |
                   +-------------------------------+
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0        
                ];
            
            const frames1 = 
                new Uint8Array(65546);
            frames1.fill(
                parseInt(
                    bits1.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(16, 24).join(''),
                    2 /* base */
                ),
                2 /* start */,
                3 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(24, 32).join(''),
                    2 /* base */
                ),
                3 /* start */,
                4 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(34, 40).join(''),
                    2 /* base */
                ),
                4 /* start */,
                5 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(40, 48).join(''),
                    2 /* base */
                ),
                5 /* start */,
                6 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(48, 56).join(''),
                    2 /* base */
                ),
                6 /* start */,
                7 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(56, 64).join(''),
                    2 /* base */
                ),
                7 /* start */,
                8 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(64, 72).join(''),
                    2 /* base */
                ),
                8 /* start */,
                9 /* end */
            );
            frames1.fill(
                parseInt(
                    bits1.slice(72, 80).join(''),
                    2 /* base */
                ),
                9 /* start */,
                10 /* end */
            );
            frames1.set(
                payload,
                10 /* offset */
            );
            
            const iterator1 = 
                parseMore(frames1);
            const parsedFrame1 = 
                await iterator1.next();
            expect(parsedFrame1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload
                },
                done: false
            });
            const return1 = 
                await iterator1.next();
            expect(return1).toEqual({
                value: undefined,
                done: true
            });
            
            // with masking
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(65536);
            maskedPayload.fill(1);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        maskedPayload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits2 = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |   extended-payload-length-63  |
                   |I|S|S|S|       |A|             |                               |
                   |N|V|V|V|       |S|             |                               |
                   | |1|2|3|       |K|             |                               |
                   +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
                */
                    1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                /*
                   |              extended-payload-length-63 continued             |
                   + - - - - - - - - - - - - - - - +-------------------------------+
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                /*
                   |                               |
                   +-------------------------------+
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0        
                ];
            
            const frames2 = 
                new Uint8Array(65550);
            frames2.fill(
                parseInt(
                    bits2.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(16, 24).join(''),
                    2 /* base */
                ),
                2 /* start */,
                3 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(24, 32).join(''),
                    2 /* base */
                ),
                3 /* start */,
                4 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(34, 40).join(''),
                    2 /* base */
                ),
                4 /* start */,
                5 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(40, 48).join(''),
                    2 /* base */
                ),
                5 /* start */,
                6 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(48, 56).join(''),
                    2 /* base */
                ),
                6 /* start */,
                7 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(56, 64).join(''),
                    2 /* base */
                ),
                7 /* start */,
                8 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(64, 72).join(''),
                    2 /* base */
                ),
                8 /* start */,
                9 /* end */
            );
            frames2.fill(
                parseInt(
                    bits2.slice(72, 80).join(''),
                    2 /* base */
                ),
                9 /* start */,
                10 /* end */
            );
            frames2.set(
                maskingKey,
                10 /* offset */
            );
            frames2.set(
                maskedPayload,
                14 /* offset */
            );
            
            const iterator2 = 
                parseMore(frames2);
            const parsedFrame2 = 
                await iterator2.next();
            expect(parsedFrame2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: new Uint8Array(65536).fill(1)
                },
                done: false
            });
            const return2 = 
                await iterator2.next();
            expect(return2).toEqual({
                value: undefined,
                done: true
            });
        });
    
        it(
            'throws an error if the most significant bit of extended-payload-' + 
            'length-63 is not zero'
        , async function () {
            const payload = 
                new Uint8Array(65536);
            payload.fill(1);
            
            const bits = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |   extended-payload-length-63  |
                   |I|S|S|S|       |A|             |                               |
                   |N|V|V|V|       |S|             |                               |
                   | |1|2|3|       |K|             |                               |
                   +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
                */
                    1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                /*
                   |              extended-payload-length-63 continued             |
                   + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                /*
                   |                               |
                   +-------------------------------+
                */
                    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0        
                ];
            
            const frames = 
                new Uint8Array(65546);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(16, 24).join(''),
                    2 /* base */
                ),
                2 /* start */,
                3 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(24, 32).join(''),
                    2 /* base */
                ),
                3 /* start */,
                4 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(34, 40).join(''),
                    2 /* base */
                ),
                4 /* start */,
                5 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(40, 48).join(''),
                    2 /* base */
                ),
                5 /* start */,
                6 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(48, 56).join(''),
                    2 /* base */
                ),
                6 /* start */,
                7 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(56, 64).join(''),
                    2 /* base */
                ),
                7 /* start */,
                8 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(64, 72).join(''),
                    2 /* base */
                ),
                8 /* start */,
                9 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(72, 80).join(''),
                    2 /* base */
                ),
                9 /* start */,
                10 /* end */
            );
            frames.set(
                payload,
                10 /* offset */
            );
            
            const parseMore = 
                parseWebsocketFramesFactory();
        
            let framesYielded = 
                0;

            try {
                for await (const parsedFrame of parseMore(frames)) {
                    framesYielded++;
                }
            } catch (err) {
                expect(err.message).toEqual(
                    `Most significant bit of a 64-bit extended payload length must be zero`
                );
            }
            expect(framesYielded).toEqual(0);
        });
    
        it(
            'unmasks a masked payload'
        , async function () {
            const payload = 
                new Uint8Array(64);
            payload.fill(1);
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(64);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        payload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0
                ];                
            
            const frames = 
                new Uint8Array(70);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames.set(
                maskingKey,
                2 /* offset */
            );
            frames.set(
                maskedPayload,
                6 /* offset */
            );
            
            const parseMore = 
                parseWebsocketFramesFactory();
        
            let framesYielded = 
                0;
            
            for await (const parsedFrame of parseMore(frames)) {
                expect(parsedFrame).toEqual({
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload
                });
                framesYielded++;
            }
            expect(framesYielded).toEqual(1);
        });
    
        it(
            'does not unmask an unmasked payload'
        , async function () {
            const payload = 
                new Uint8Array(64);
            payload.fill(1);
            
            const bits = [
            /*  
               |F|R|R|R| opcode|M| payload-len |
               |I|S|S|S|       |A|             |
               |N|V|V|V|       |S|             |
               | |1|2|3|       |K|             |
            */
                1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0
            ];                
            
            const frames = 
                new Uint8Array(66);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames.set(
                payload,
                2 /* offset */
            );
            
            const parseMore = 
                parseWebsocketFramesFactory();
        
            let framesYielded = 
                0;
            
            for await (const parsedFrame of parseMore(frames)) {
                expect(parsedFrame).toEqual({
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload
                });
                framesYielded++;
            }
            expect(framesYielded).toEqual(1);
        });
    
        it(
            'yields an Object with { fin, rsv1, rsv2, rsv3, opcode, mask, payload }'
        , async function () {
            const payload = 
                new Uint8Array(64);
            payload.fill(1);
            
            /* NOT A REAL FRAME */
            
            const bits = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    0,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0
                ];
            
            const frames = 
                new Uint8Array(66);
            frames.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            frames.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            frames.set(
                payload,
                2 /* offset */
            );
            
            const parseMore = 
                parseWebsocketFramesFactory();
        
            let framesYielded = 
                0;
            
            for await (const parsedFrame of parseMore(frames)) {
                expect(parsedFrame).toEqual({
                    fin: 0,
                    rsv1: 1,
                    rsv2: 1,
                    rsv3: 1,
                    opcode: 0xf,
                    mask: 0,
                    payload
                });
                framesYielded++;
            }
            expect(framesYielded).toEqual(1);
        });
    
        it(
            'yields multiple times if more than one websocket message is included ' + 
            'in \`messagesUint8\`'
        , async function () {

            const encoder = 
                new TextEncoder('utf-8')
            
            const message1 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message1')), { isUtf8: true }
                );
            const message2 = 
                prepareWebsocketFrame(
                    new Uint8Array(0), { opcode: 0x9 }
                );
            const message3 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message3')), { isUtf8: true }
                );
            
            // masked binary frame
            const message4Payload = 
                new Uint8Array(64);
            message4Payload.fill(1);
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(64);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        message4Payload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0
                ];        
            
            const message4 = 
                new Uint8Array(70);
            message4.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            message4.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            message4.set(
                maskingKey,
                2 /* offset */
            );
            message4.set(
                maskedPayload,
                6 /* offset */
            );
            
            const message5 = 
                prepareWebsocketFrame(
                    new Uint8Array(393216).fill(1)
                );
            
            const message6 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message6')), { isUtf8: true }
                );
            
            const frames = 
                new Uint8Array(
                    message1.length + message2.length + message3.length + message4.length + 
                    message5.length + message6.length
                );
                
            frames.set(
                message1
            );
            frames.set(
                message2,
                message1.length /* offset */
            );
            frames.set(
                message3,
                message1.length + message2.length
            );
            frames.set(
                message4,
                message1.length + message2.length + message3.length
            );
            frames.set(
                message5,
                message1.length + message2.length + message3.length + 
                message4.length /* offset */
            );
            frames.set(
                message6,
                message1.length + message2.length + message3.length + 
                message4.length + message5.length /* offset */
            );

            const parseMore = 
                parseWebsocketFramesFactory();
            const decoder = 
                new TextDecoder('utf-8');
                   
            const iterator = 
                parseMore(frames);
            
            const parsedMessage1 = 
                await iterator.next();
            expect(decoder.decode(parsedMessage1.value.payload)).toEqual('message1');
            expect(parsedMessage1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message1'))
                },
                done: false
            });
            const parsedMessage2 = 
                await iterator.next();
            expect(parsedMessage2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x9,
                    mask: 0,
                    payload: new Uint8Array(0)
                },
                done: false
            });
            const parsedMessage3 = 
                await iterator.next();
            expect(decoder.decode(parsedMessage3.value.payload)).toEqual('message3');
            expect(parsedMessage3).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message3'))
                },
                done: false
            });
            const parsedMessage4 = 
                await iterator.next();
            expect(parsedMessage4).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: message4Payload
                },
                done: false
            });
            const parsedMessage5 = 
                await iterator.next();
            expect(parsedMessage5).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload: new Uint8Array(393216).fill(1)
                },
                done: false
            });
            const parsedMessage6 = 
                await iterator.next();
            expect(decoder.decode(parsedMessage6.value.payload)).toEqual('message6');
            expect(parsedMessage6).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message6'))
                },
                done: false
            });
        });
        
        it(
            'returns if \`messagesUint8\` ends with a partial frame, and subsequent ' + 
            'call(s) yield that frame if enough bytes are sent, or return if less ' + 
            'than enough bytes are sent'
        , async function () {
            const encoder = 
                new TextEncoder('utf-8')
            
            const message1 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message1')), { isUtf8: true }
                );
            const message2 = 
                prepareWebsocketFrame(
                    new Uint8Array(0), { opcode: 0x9 }
                );
            const message3 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message3')), { isUtf8: true }
                );
            
            // masked binary frame
            const message4Payload = 
                new Uint8Array(64);
            message4Payload.fill(1);
            
            const maskingKey = 
                new Uint8Array(4);
            for(let i = 0; i < 4; i++) {
                maskingKey.fill(
                    Math.round(Math.random() * 255),
                    i /* start */,
                    i + 1 /* end */
                );
            }
            
            const maskedPayload = 
                new Uint8Array(64);
            for(let i = 0; i < maskedPayload.length; i++) {
                maskedPayload.fill(
                    (
                        message4Payload[i]
                        ^ /* XOR */
                        maskingKey[(i % 4)]
                    )
                    , i /* start position */
                    , i + 1 /* end position */
                );
            }
            
            const bits = 
                [
                /*  
                   |F|R|R|R| opcode|M| payload-len |
                   |I|S|S|S|       |A|             |
                   |N|V|V|V|       |S|             |
                   | |1|2|3|       |K|             |
                */
                    1,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0
                ];        
            
            const message4 = 
                new Uint8Array(70);
            message4.fill(
                parseInt(
                    bits.slice(0, 8).join(''), 
                    2 /* base */
                ),
                0 /* start */,
                1 /* end */
            );
            message4.fill(
                parseInt(
                    bits.slice(8, 16).join(''), 
                    2 /* base */
                ),
                1 /* start */,
                2 /* end */
            );
            message4.set(
                maskingKey,
                2 /* offset */
            );
            message4.set(
                maskedPayload,
                6 /* offset */
            );
            
            const message5 = 
                prepareWebsocketFrame(
                    new Uint8Array(393216).fill(1)
                );
            
            const message6 = 
                prepareWebsocketFrame(
                    new Uint8Array(encoder.encode('message6')), { isUtf8: true }
                );
            
            const frames = 
                new Uint8Array(
                    message1.length + message2.length + message3.length + message4.length + 
                    message5.length + message6.length
                );
                
            frames.set(
                message1
            );
            frames.set(
                message2,
                message1.length /* offset */
            );
            frames.set(
                message3,
                message1.length + message2.length
            );
            frames.set(
                message4,
                message1.length + message2.length + message3.length
            );
            frames.set(
                message5,
                message1.length + message2.length + message3.length + 
                message4.length /* offset */
            );
            frames.set(
                message6,
                message1.length + message2.length + message3.length + 
                message4.length + message5.length /* offset */
            );

            const parseMore = 
                parseWebsocketFramesFactory();
            const decoder = 
                new TextDecoder('utf-8');
            
            /* 
             * test two chunks
            */
            
            const iterator1 = 
                parseMore(
                    frames.slice(
                        0 /* start */,
                        message1.length + message2.length + message3.length + 16 /* end */
                    )
                );
            const parsedMessage1 = 
                await iterator1.next();
            expect(decoder.decode(parsedMessage1.value.payload)).toEqual('message1');
            expect(parsedMessage1).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message1'))
                },
                done: false
            });
            const parsedMessage2 = 
                await iterator1.next();
            expect(parsedMessage2).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x9,
                    mask: 0,
                    payload: new Uint8Array(0)
                },
                done: false
            });
            const parsedMessage3 = 
                await iterator1.next();
            expect(decoder.decode(parsedMessage3.value.payload)).toEqual('message3');
            expect(parsedMessage3).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message3'))
                },
                done: false
            });
            const return1 = 
                await iterator1.next();
            expect(return1).toEqual({
                value: undefined,
                done: true
            });
            
            const iterator2 = 
                parseMore(
                    frames.slice(
                        message1.length + message2.length + message3.length + 16 /* start */,
                        frames.length /* end */
                    )
                );
            const parsedMessage4 = 
                await iterator2.next();
            expect(parsedMessage4).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: message4Payload
                },
                done: false
            });
            const parsedMessage5 = 
                await iterator2.next();
            expect(parsedMessage5).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload: new Uint8Array(393216).fill(1)
                },
                done: false
            });
            const parsedMessage6 = 
                await iterator2.next();
            expect(decoder.decode(parsedMessage6.value.payload)).toEqual('message6');
            expect(parsedMessage6).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message6'))
                },
                done: false
            });
            const return2 = 
                await iterator2.next();
            expect(return2).toEqual({
                value: undefined,
                done: true
            });
            
            /*
             * test split in various ways
            */
            
            // initial part of text frame
            const iterator3 = 
                parseMore(
                    frames.slice(
                        0 /* start */,
                        1 /* end */
                    )
                );
            const return3 = 
                await iterator3.next();
            expect(return3).toEqual({
                value: undefined,
                done: true
            });
            // rest of text frame
            const iterator4 = 
                parseMore(
                    frames.slice(
                        1 /* start */,
                        message1.length /* end */
                    )
                );
            const parsedMessage7 = 
                await iterator4.next();
            expect(decoder.decode(parsedMessage7.value.payload)).toEqual('message1');
            const return4 = 
                await iterator4.next();
            expect(return4).toEqual({
                value: undefined,
                done: true
            });
            const iterator5 = 
                parseMore(
                    frames.slice(
                        message1.length /* start */,
                        message1.length + 2 + message3.length
                    )
                );
            const parsedMessage8 = 
                await iterator5.next();
            expect(parsedMessage8).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x9,
                    mask: 0,
                    payload: new Uint8Array(0)
                },
                done: false
            });
            const parsedMessage9 = 
                await iterator5.next();
            expect(decoder.decode(parsedMessage9.value.payload)).toEqual('message3');
            expect(parsedMessage9).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message3'))
                },
                done: false
            });
            const return5 = 
                await iterator5.next();
            expect(return5).toEqual({
                value: undefined,
                done: true
            });
            // initial part of ping
            const iterator6 = 
                parseMore(
                    frames.slice(
                        0 /* start */,
                        message1.length + 1 /* end */
                    )
                );
            const parsedMessage10 = 
                await iterator6.next();
            expect(decoder.decode(parsedMessage10.value.payload)).toEqual('message1');
            expect(parsedMessage10).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message1'))
                },
                done: false
            });
            const return6 = 
                await iterator6.next();
            expect(return6).toEqual({
                value: undefined,
                done: true
            });
            // rest of ping
            const iterator7 = 
                parseMore(
                    frames.slice(
                        message1.length + 1 /* start */,
                        message1.length + 2 /* end */
                    )
                );
            const parsedMessage11 = 
                await iterator7.next();
            expect(parsedMessage11).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x9,
                    mask: 0,
                    payload: new Uint8Array(0)
                },
                done: false
            })
            const return7 = 
                await iterator7.next();
            expect(return7).toEqual({
                value: undefined,
                done: true
            });
            // initial part of masked binary frame
            const iterator8 = 
                parseMore(
                    frames.slice(
                        message1.length + message2.length + message3.length /* start */,
                        message1.length + message2.length + message3.length + 1
                    )
                );
            const return8 = 
                await iterator8.next();
            expect(return8).toEqual({
                value: undefined,
                done: true
            });
            // initial part of masked binary frame
            const iterator9 = 
                parseMore(
                    frames.slice(
                        message1.length + message2.length + message3.length + 1,
                        message1.length + message2.length + message3.length + 3
                    )
                );
            const return9 = 
                await iterator9.next();
            expect(return9).toEqual({
                value: undefined,
                done: true
            });
            // initial part of masked binary frame, part of payload
            const iterator10 = 
                parseMore(
                    frames.slice(
                        message1.length + message2.length + message3.length + 3,
                        message1.length + message2.length + message3.length + 32
                    )
                );
            const return10 = 
                await iterator10.next();
            expect(return10).toEqual({
                value: undefined,
                done: true
            });
            // rest of payload of masked binary frame
            const iterator11 = 
                parseMore(
                    frames.slice(
                        message1.length + message2.length + message3.length + 32,
                        message1.length + message2.length + message3.length + message4.length
                    )
                );
            const parsedMessage12 = 
                await iterator11.next();
            expect(parsedMessage12).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: message4Payload
                },
                done: false
            });
            const return11 = 
                await iterator11.next();
            expect(return11).toEqual({
                value: undefined,
                done: true
            });
            
            /* 
             * test split in regular chunks
            */
            
            /*
             * frames.length is 393328 bytes, so we can chunk it into 6 chunks of 65536 
             * bytes and one chunk of 112 bytes
            */
            const iterator12 = 
                parseMore(
                    frames.slice(
                        0,
                        65536
                    )
                );
            const parsedMessage13 = 
                await iterator12.next();
            expect(decoder.decode(parsedMessage13.value.payload)).toEqual('message1');
            expect(parsedMessage13).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message1'))
                },
                done: false
            });
            const parsedMessage14 = 
                await iterator12.next();
            expect(parsedMessage14).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x9,
                    mask: 0,
                    payload: new Uint8Array(0)
                },
                done: false
            });
            const parsedMessage15 = 
                await iterator12.next();
            expect(decoder.decode(parsedMessage15.value.payload)).toEqual('message3');
            expect(parsedMessage15).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message3'))
                },
                done: false
            });
            const parsedMessage16 = 
                await iterator12.next();
            expect(parsedMessage16).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 1,
                    payload: message4Payload
                },
                done: false
            });
            const return12 = 
                await iterator12.next();
            expect(return12).toEqual({
                value: undefined,
                done: true
            });
            const iterator13 = 
                parseMore(
                    frames.slice(
                        65536,
                        131072
                    )
                );
            const return13 = 
                await iterator13.next();
            expect(return13).toEqual({
                value: undefined,
                done: true
            });
            const iterator14 = 
                parseMore(
                    frames.slice(
                        131072,
                        196608
                    )
                );
            const return14 = 
                await iterator14.next();
            expect(return14).toEqual({
                value: undefined,
                done: true
            });
            const iterator15 = 
                parseMore(
                    frames.slice(
                        196608,
                        262144
                    )
                );
            const return15 = 
                await iterator15.next();
            expect(return15).toEqual({
                value: undefined,
                done: true
            });
            const iterator16 = 
                parseMore(
                    frames.slice(
                        262144,
                        327680
                    )
                );
            const return16 = 
                await iterator16.next();
            expect(return16).toEqual({
                value: undefined,
                done: true
            });
            const iterator17 = 
                parseMore(
                    frames.slice(
                        327680,
                        393216
                    )
                );
            const return17 = 
                await iterator17.next();
            expect(return17).toEqual({
                value: undefined,
                done: true
            });
            const iterator18 = 
                parseMore(
                    frames.slice(
                        393216,
                        frames.length
                    )
                );
            const parsedMessage17 = 
                await iterator18.next();
            expect(parsedMessage17).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 2,
                    mask: 0,
                    payload: new Uint8Array(393216).fill(1)
                },
                done: false
            });
            const parsedMessage18 = 
                await iterator18.next();
            expect(decoder.decode(parsedMessage18.value.payload)).toEqual('message6');
            expect(parsedMessage18).toEqual({
                value: {
                    fin: 1,
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 1,
                    mask: 0,
                    payload: new Uint8Array(encoder.encode('message6'))
                },
                done: false
            });
            const return18 = 
                await iterator18.next();
            expect(return18).toEqual({
                value: undefined,
                done: true
            });
        });
        
    });
    
});