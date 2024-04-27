/*
 * Copyright (c) Jon Lachlan 2020
*/

import prepareCloseFramePayload from './prepareCloseFramePayload.js';

describe(
    'prepareCloseFramePayload'
, function () {
        
    it(
        'throws an error if \`code\` is not an integer number'
    , function () {
    
        let errorsCount = 
            0;
        try {
            const payload = 
                prepareCloseFramePayload();
        } catch(err) {
            expect(err.message).toEqual(
                'code must be an integer number'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`code\` is not in the range 1000 <= x < 65536'
    , function () {
    
        let errorsCount = 
            0;
        try {
            const payload1 = 
                prepareCloseFramePayload({
                    code: 0
                });
        } catch(err) {
            expect(err.message).toEqual(
                'code is not in the acceptable range 1000 <= x < 65536'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        try {
            const payload2 = prepareCloseFramePayload({
                code: 999
            });
        } catch(err) {
            expect(err.message).toEqual(
                'code is not in the acceptable range 1000 <= x < 65536'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        try {
            const payload3 = 
                prepareCloseFramePayload({
                    code: 65536
                });
        } catch(err) {
            expect(err.message).toEqual(
                'code is not in the acceptable range 1000 <= x < 65536'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
    });
    
    it(
        'throws an error if `\reason\` is provided and is not a string'
    , function () {
        
        let errorsCount = 
            0;
        try {
            const payload1 = 
                prepareCloseFramePayload({
                    code: 1000
                });
        } catch(err) {
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        errorsCount = 
            0;
            
        try {
            const payload2 = 
                prepareCloseFramePayload({
                    code: 1000,
                    reason: 4
                });
        } catch(err) {
            expect(err.message).toEqual(
                'reason must be a string'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const payload3 = 
                prepareCloseFramePayload({
                    code: 1000,
                    reason: {}
                });
        } catch(err) {
            expect(err.message).toEqual(
                'reason must be a string'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount =
            0;
        
        try {
            const payload4 =
                prepareCloseFramePayload({
                    code: 1000,
                    reason: () => null
                });
        } catch(err) {
            expect(err.message).toEqual(
                'reason must be a string'
            );
            errorsCount++;
        }
        
    });
    
    
    it(
        'returns a Uint8Array with \`code\` encoded as a two-byte unsigned ' +
        'integer in network order'
    , function () {
        
        const payload1 = 
            prepareCloseFramePayload({
                code: 1000
            });
        expect(payload1).toEqual(
            new Uint8Array(2)
                .fill(
                    3,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    232,
                    1 /* start position */,
                    2 /* end position */
                )
        );
        
        const payload2 = 
            prepareCloseFramePayload({
                code: 4999
            });
        expect(payload2).toEqual(
            new Uint8Array(2)
                .fill(
                    19,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    135,
                    1 /* start position */,
                    2 /* end position */
                )
        );
        
        const payload3 = 
            prepareCloseFramePayload({
                code: 65535
            });
        expect(payload3).toEqual(
            new Uint8Array(2)
                .fill(
                    255,
                    0 /* start position */,
                    1 /* end position */ 
                )
                .fill(
                    255,
                    1 /* start position */,
                    2 /* end position */
                )
        );
        
    });
    
    it(
        'includes \`extensionData\` at the beginning of the payload if provided'
    , function () {
        
        const payload1 = 
            prepareCloseFramePayload({
                extensionData: new Uint8Array(10).fill(1),
                code: 1000
            });
        expect(payload1).toEqual(
            new Uint8Array(12)
                .fill(
                    1,
                    0 /* start position */,
                    10 /* end position */
                )
                .fill(
                    3,
                    10 /* start position */,
                    11 /* end position */
                )
                .fill(
                    232,
                    11 /* start position */,
                    12 /* end position */      
                )
        );

        const reason = 
            'Test.'
        ;
        const encoder = 
            new TextEncoder('utf-8');
        const payload2 = prepareCloseFramePayload({
            extensionData: new Uint8Array(60).fill(2),
            code: 1000,
            reason
        });
        const expectedPayload2 = 
            new Uint8Array(
                62 
                + 
                new Uint8Array(
                    encoder.encode(reason)
                ).length
            );
        expectedPayload2.set(
            new Uint8Array(
                encoder.encode(reason)
            ),
            62 /* offset */
        );
        expectedPayload2
            .fill(
                2,
                0 /* start position */,
                60 /* end position */
            )
            .fill(
                3,
                60 /* start position */,
                61 /* end position */
            )
            .fill(
                232,
                61 /* start position */,
                62 /* end position */
            )
        expect(payload2).toEqual(
            expectedPayload2
        );
    });
    
    it(
        'includes \`reason\` after \`code\`, if provided, encoded as UTF-8'
    , function () {

        const reason = 
            'This is a test.'
        ;
        const encoder = 
            new TextEncoder('utf-8');
        const payload1 = 
            prepareCloseFramePayload({
                code: 1000,
                reason
            });
        const expectedPayload1 = 
            new Uint8Array(
                2
                +
                new Uint8Array(
                    encoder.encode(reason)
                ).length
            );
        expectedPayload1.set(
            new Uint8Array(
                encoder.encode(reason)
            ),
            2 /* offset */
        );
        expectedPayload1
            .fill(
                3,
                0 /* start position */,
                1 /* end position */
            )
            .fill(
                232,
                1 /* start position */,
                2 /* end position */
            )
        expect(payload1).toEqual(
            expectedPayload1
        );
        
        const payload2 = 
            prepareCloseFramePayload({
                extensionData: new Uint8Array(45).fill(29),
                code: 1000,
                reason
            });
        const expectedPayload2 = 
            new Uint8Array(
                45
                +
                2
                +
                new Uint8Array(
                    encoder.encode(reason)
                ).length
            );
        expectedPayload2.set(
            new Uint8Array(
                encoder.encode(reason)
            ),
            47 /* offset */
        );
        expectedPayload2
            .fill(
                29,
                0 /* start position */,
                45 /* end position */
            )
            .fill(
                3,
                45 /* start position */,
                46 /* end position */
            )
            .fill(
                232,
                46 /* start position */,
                47 /* end position */
            )
        expect(payload2).toEqual(
            expectedPayload2
        );
    });
        
});