/*
 * Copyright (c) Jon Lachlan 2020
*/

import prepareWebsocketFrame from './prepareWebsocketFrame';

describe('prepareWebsocketFrame', function() {
    
    it(
        'throws an error if \`payload\` is not an instance of Uint8Array'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame =
                prepareWebsocketFrame();
        } catch (error) {
            expect(error.message).toEqual(
                'payload not an instance of Uint8Array'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`opcode\` is not an integer between 0 and 15 or undefined'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame2 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: 0x0
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame3 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: 0xF
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame4 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: -1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'opcode not an integer between 0 and 15'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame5 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: 1.1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'opcode not an integer between 0 and 15'
            );
            errorsCount++;
        }        
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame6 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: 1.6
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'opcode not an integer between 0 and 15'
            );
            errorsCount++;
        }        
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;

        try {
            const frame7 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: 16
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'opcode not an integer between 0 and 15'
            );
            errorsCount++;
        }        
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame8 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        opcode: ''
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'opcode not an integer between 0 and 15'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`fin\` is not an integer between 0 and 1 or undefined'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }        
        expect(errorsCount).toEqual(0);
        
        try {
            const frame2 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: 0
                    }
                );    
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame3 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: 1
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame4 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: -1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'fin is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame5 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: 0.1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'fin is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const frame6 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: 0.8
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'fin is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame7 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: 2
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'fin is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame8 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        fin: ''
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'fin is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`rsv1\` is not an integer between 0 and 1'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }        
        expect(errorsCount).toEqual(0);
        
        try {
            const frame2 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: 0
                    }
                );    
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame3 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: 1
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame4 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: -1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv1 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame5 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: 0.1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv1 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const frame6 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: 0.8
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv1 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame7 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: 2
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv1 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame8 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv1: ''
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv1 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`rsv2\` is not an integer between 0 and 1'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }        
        expect(errorsCount).toEqual(0);
        
        try {
            const frame2 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: 0
                    }
                );    
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame3 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: 1
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame4 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: -1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv2 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame5 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: 0.1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv2 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const frame6 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: 0.8
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv2 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame7 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: 2
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv2 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame8 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv2: ''
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv2 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'throws an error if \`rsv3\` is not an integer between 0 and 1'
    , function () {
        
        let errorsCount = 
            0;
        
        try {
            const frame1 = 
                prepareWebsocketFrame(
                    new Uint8Array(0)
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }        
        expect(errorsCount).toEqual(0);
        
        try {
            const frame2 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: 0
                    }
                );    
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame3 =
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: 1
                    }
                );
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
        
        try {
            const frame4 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: -1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv3 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame5 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: 0.1
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv3 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
        
        try {
            const frame6 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: 0.8
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv3 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame7 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: 2
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv3 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
        errorsCount = 
            0;
            
        try {
            const frame8 = 
                prepareWebsocketFrame(
                    new Uint8Array(0),
                    {
                        rsv3: ''
                    }
                );
        } catch (error) {
            expect(error.message).toEqual(
                'rsv3 is not an integer between 0 and 1'
            );
            errorsCount++;
        }
        expect(errorsCount).toEqual(1);
    });
    
    it(
        'sets opcode to 2 by default'
    , function () {
        
        const frame = 
            prepareWebsocketFrame(
                new Uint8Array(0)
            );
        expect(frame).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets opcode to 1 if \`isUtf8\` is true, unless \`opcode\` is set'
    , function () {
        
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    isUtf8: true
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    129,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 =
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    isUtf8: true,
                    opcode: 0x3 /* registry non-control opcode */
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    131,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv1 to 0 by default'
    , function () {
        
        const frame = 
            prepareWebsocketFrame(
                new Uint8Array(0)
            );
        expect(frame).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv2 to 0 by default'
    , function () {
            
        const frame = 
            prepareWebsocketFrame(
                new Uint8Array(0)
            );
        expect(frame).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv3 to 0 by default'
    , function () {
            
        const frame = 
            prepareWebsocketFrame(
                new Uint8Array(0)
            );
        expect(frame).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets mask to 0'
    , function () {
              
        const frame = 
            prepareWebsocketFrame(
                new Uint8Array(0)
            );
        expect(frame).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'allocates the correct number of bytes for the frame'
    , function () {
            
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 =
            prepareWebsocketFrame(
                new Uint8Array(125)
            );
        expect(frame2).toEqual(
            new Uint8Array(127)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    125,
                    1 /* start position */,
                    2 /* end position */
                )
        );
        
        const frame3 = 
            prepareWebsocketFrame(
                new Uint8Array(126)
            );
        expect(frame3).toEqual(
            new Uint8Array(130)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    126,
                    1 /* start position */,
                    2 /* end position */
                )
                .fill(
                    126,
                    3 /* start position */,
                    4 /* end position */
                )
        );
        
        const frame4 = 
            prepareWebsocketFrame(
                new Uint8Array(65535)
            );
        expect(frame4).toEqual(
            new Uint8Array(65539)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    126,
                    1 /* start position */,
                    2 /* end position */
                )
                .fill(
                    255,
                    2 /* start position */,
                    3 /* end position */
                )
                .fill(
                    255,
                    3 /* start position */,
                    4 /* end position */
                )
        );
        
        const frame5 = 
             prepareWebsocketFrame(
                new Uint8Array(65536)
             );
        expect(frame5).toEqual(
            new Uint8Array(65546)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    127,
                    1 /* start position */,
                    2 /* end position */
                )
                .fill(
                    1,
                    7 /* start position */,
                    8 /* end position */
                )
        );
        
        const frame6 =
            prepareWebsocketFrame(
                new Uint8Array(10000000)
            );
        expect(
            frame6.slice(0, 10)
        ).toEqual(
            new Uint8Array(10)    
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
                .fill(
                    127,
                    1 /* start position */,
                    2 /* end position */
                )
                // 8388608,4194304,2097152,1048576,524288,262144,131072,65536
                // [1,0,0,1,1,0,0,0]
                // 38528
                // 32768,16384,8192,4096,2048,1024,512,256
                // [1,0,0,1,0,1,1,0]
                // 128
                // 128,64,32,16,8,4,2,1
                // [1,0,0,0,0,0,0,0]
                .fill(
                    152,
                    7 /* start position */,
                    8 /* end position */
                )
                .fill(
                    150,
                    8 /* start position */,
                    9 /* end position */
                )
                .fill(
                    128,
                    9 /* start position */,
                    10 /* end position */
                )
            );
        expect(frame6[10000009]).toEqual(0);
        expect(frame6[10000010]).toEqual(undefined);
    });
    
    it(
        'sets fin correctly'
    , function () {
    
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    fin: 1
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    fin: 0
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    2,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv1 correctly'
    , function () {
        
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv1: 1
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    194,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv1: 0
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv2 correctly'
    , function () {
        
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv2: 1
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    162,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv2: 0
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets rsv3 correctly'
    , function () {
        
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv3: 1
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    146,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    rsv3: 0
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    130,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
    
    it(
        'sets opcode correctly'
    , function () {
        
        const frame1 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    opcode: 0x0
                }
            );
        expect(frame1).toEqual(
            new Uint8Array(2)
                .fill(
                    128,
                    0 /* start position */,
                    1 /* end position */
                )
        );
        
        const frame2 = 
            prepareWebsocketFrame(
                new Uint8Array(0),
                {
                    opcode: 0xF
                }
            );
        expect(frame2).toEqual(
            new Uint8Array(2)
                .fill(
                    143,
                    0 /* start position */,
                    1 /* end position */
                )
        );
    });
});