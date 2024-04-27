/*
 * Copyright (c) Jon Lachlan 2020
*/

import uint2ArrayFromUint8Value from './uint2ArrayFromUint8Value.js';

describe(
    'uint2ArrayFromUint8Value'
, function () {
    
    it(
        'correctly converts any integer from 0 to 255 to base-2 and returns ' +
        'it as an array of integers'
    , function () {
    
        expect(
            uint2ArrayFromUint8Value(0)
        ).toEqual(
            [0,0,0,0,0,0,0,0]
        );
        
        expect(
            uint2ArrayFromUint8Value(255)
        ).toEqual(
            [1,1,1,1,1,1,1,1]
        );
    });
    
    it.skip(
        'throws an error if \`uint8Value\` is not an integer between 0 and ' +
        '255'
    , function () {
        
        /*
         * Not implemented
        */
        
        let errorsCount = 
            0;
        try {
            const value1 = 
                uint2ArrayFromUint8Value(-1);
        } catch (error) {
            expect(error.message).toEqual(
                'uint8Value is not an unsigned integer'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const value2 = 
                uint2ArrayFromUint8Value(256);
        } catch (error) {
            expect(error.message).toEqual(
                'uint8Value is not an unsigned integer'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const value1 = 
                uint2ArrayFromUint8Value(
                    // floating-point JavaScript will not produce an integer 3
                    ((0.1 + 0.2) * 10)
                );
        } catch (error) {
            expect(error.message).toEqual(
                'uint8Value is not an unsigned integer'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
});