/*
 * Copyright (c) Jon Lachlan 2020
*/

import PartialFrameStore from './PartialFrameStore.js';
import prepareWebsocketFrame from './prepareWebsocketFrame';

describe('PartialFrameStore', function () {

    it(
        'stores a value with set() and return and unsets it with get()'
    , function () {
        
        const partialFrameStore = 
            new PartialFrameStore();
            
        partialFrameStore.set(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    1,
                    2 /* start position */,
                    3 /* end position */
                )
                .fill(
                    2,
                    3 /* start position */,
                    5 /* end position */
                )
                .fill(
                    3,
                    5 /* start position */,
                    6 /* end position */
                )
        );
        
        const partialFrame = 
            partialFrameStore.get();
        expect(partialFrame).toEqual(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    1,
                    2 /* start position */,
                    3 /* end position */
                )
                .fill(
                    2,
                    3 /* start position */,
                    5 /* end position */
                )
                .fill(
                    3,
                    5 /* start position */,
                    6 /* end position */
                )
        );
        expect(partialFrame.length).toEqual(6);

        const fullFrame = 
            prepareWebsocketFrame(
                new Uint8Array(10)
                    .fill(
                        1,
                        0 /* start position */,
                        1 /* end position */
                    )
                    .fill(
                        2,
                        1 /* start position */,
                        3 /* end position */
                    )
                    .fill(
                        3,
                        3 /* start position */,
                        4 /* end position */
                    )
                    .fill(
                        3,
                        4 /* start position */,
                        10 /* end position */
                    )
            );
        expect(
            fullFrame.slice(
                0 /* begin */,
                6 /* end */
            )
        ).toEqual(partialFrame);
        
        let errorsCount = 
            0;
        try {
            partialFrameStore.get();
        } catch (error) {
            expect(error.message).toEqual(
                'partial frame has not been set'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'indicates a value has been set with isSet()'
    , function () {
    
        const partialFrame = 
            new PartialFrameStore();
        
        expect(partialFrame.isSet()).toEqual(false);
        
        partialFrame.set(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    1,
                    2 /* start position */,
                    6 /* end position */
                )
        );
        expect(partialFrame.isSet()).toEqual(true);
        
        partialFrame.get();
        expect(partialFrame.isSet()).toEqual(false);
        
        partialFrame.set(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    2,
                    2 /* start position */,
                    6 /* end position */
                )
        );
        expect(partialFrame.isSet()).toEqual(true);
    });
    
    it(
        'throws an error if set() is called when a value was already set'
    , function () {
        
        const partialFrame = 
            new PartialFrameStore();
        
        partialFrame.set(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    1,
                    2 /* start position */,
                    6 /* end position */
                )
        );
        
        let errorsCount = 
            0;
        try {
            partialFrame.set(
                new Uint8Array(6)
                    .fill(
                        // final frame, opcode 0x2
                        130,
                        0 /* start position */,
                        1 /* end position */
                    )
                    .fill(
                        // mask 0, payload length 10
                        10,
                        1 /* start position */,
                        2 /* end position */
                    )
                    // first 4 bytes of payload
                    .fill(
                        2,
                        2 /* start position */,
                        6 /* end position */
                    )
            );
        } catch (error) {
            expect(error.message).toEqual(
                'partial frame is already set'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if get() is called when a value has not been set'
    , function () {
        
        const partialFrame = 
            new PartialFrameStore();
        
        let errorsCount = 
            0;
        try {
            partialFrame.get();
        } catch (error) {
            expect(error.message).toEqual(
                'partial frame has not been set'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        partialFrame.set(
            new Uint8Array(6)
                .fill(
                    // final frame, opcode 0x2
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    // mask 0, payload length 10
                    10,
                    1 /* start position */,
                    2 /* end position */
                )
                // first 4 bytes of payload
                .fill(
                    1,
                    2 /* start position */,
                    6 /* end position */
                )
        );
        
        try {
            partialFrame.get();
        } catch (error) {
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);

        try {
            partialFrame.get();    
        } catch (error) {
            expect(error.message).toEqual(
                'partial frame has not been set'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });

});