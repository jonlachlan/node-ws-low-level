/*
 * Copyright (c) Jon Lachlan 2020
*/

import FragmentedMessageStore from './FragmentedMessageStore.js';

describe('FragmentedMessageStore', function () {
    
    it(
        'stores { rsv1, rsv2, rsv3, opcode, mask, payload } on start() and ' +
        'returns it on finish()'
    , function () {
    
        const store = 
            new FragmentedMessageStore();
        const initialFrame = 
            {
                rsv1: 0,
                rsv2: 0,
                rsv3: 0,
                opcode: 0x2,
                mask: 0,
                payload: new Uint8Array(8).fill(1)
            };
        store.start(
            initialFrame
        );
        const message = 
            store.finish();
        expect(message).toEqual(
            initialFrame
        );
    });
    
    describe(
        'start()'
    , function () {
    
        it(
            'throws an error if rsv1 is not an integer between 0 and 1'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
        
            try {
                store.start({
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 1.5,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: -1,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 2,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'rsv1 is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'throws an error if rsv2 is not an integer between 0 and 1'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
            
            try {
                store.start({
                    rsv1: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: 1.5,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: -1,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: 2,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'rsv2 is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'throws an error if rsv3 is not an integer between 0 and 1'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
            
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 1.5,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: -1,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
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
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 2,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'rsv3 is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'throws an error if opcode is not a hexidecimal number between 0x0 and 0xF'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
            
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'opcode is not a hexidecimal number between 0x0 and 0xF'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    // floating-point JavaScript does not produce an integer
                    opcode: (0.1 + 0.2) * 10,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'opcode is not a hexidecimal number between 0x0 and 0xF'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 16,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'opcode is not a hexidecimal number between 0x0 and 0xF'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
            
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: -1,
                    mask: 0,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'opcode is not a hexidecimal number between 0x0 and 0xF'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        });
    
        it(
            'throws an error if mask is not an integer between 0 and 1'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
            
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'mask is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 1.5,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'mask is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: -1,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'mask is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 2,
                    payload: new Uint8Array(8).fill(1)
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'mask is not an integer between 0 and 1'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'throws and error if payload is not an instance of Uint8Array'
        , function () {
        
            let errorsCount = 
                0;
            const store = 
                new FragmentedMessageStore();
            
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0
                });
            } catch (error) {
                expect(error.message).toEqual(
                    'payload is not an instance of Uint8Array'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
        
            try {
                store.start({
                    rsv1: 0,
                    rsv2: 0,
                    rsv3: 0,
                    opcode: 0x2,
                    mask: 0,
                    payload: new Uint8Array(0)
                });
                store.finish();
            } catch (error) {
                errorsCount++;
            }
            expect(errorsCount).toEqual(0);
        });
    
    });
    
    it(
        'appends payloads with addPayload()'
    , function () {
    
        const store = 
            new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            mask: 0,
            payload: new Uint8Array(8).fill(1)
        };
        store.start(
            initialFrame
        );
        store.addPayload(
            new Uint8Array(20).fill(2)
        );
        store.addPayload(
            new Uint8Array(12).fill(3)
        );
        const message = 
            store.finish();
        expect(message).toEqual({
            ...initialFrame,
            payload: 
                new Uint8Array(40)
                    .fill(1, 0, 8)
                    .fill(2, 8, 28)
                    .fill(3, 28, 40)
        });
    });
    
    it(
        'indicates a fragmented message has been started with isStarted()'    
    , function () {
    
        const store = 
            new FragmentedMessageStore();
        expect(store.isStarted()).toEqual(
            false
        );
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            mask: 0,
            payload: new Uint8Array(8).fill(1)
        };
        store.start(
            initialFrame
        );
        expect(store.isStarted()).toEqual(
            true
        );
        const message = 
            store.finish();
        expect(message).toEqual(
            initialFrame
        );
        expect(store.isStarted()).toEqual(
            false
        );
        store.start({
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            mask: 0,
            payload: new Uint8Array(10).fill(2)
        });
        expect(store.isStarted()).toEqual(
            true
        );
    });
    
    it(
        'throws an error if start() is called again before finish() is called'
    , function () {
    
        const store = 
            new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            mask: 0,
            payload: new Uint8Array(8).fill(1)
        };
        let errorMessage;
        try {
            store.start(
                initialFrame
            );
            store.start({
                rsv1: 0,
                rsv2: 0,
                rsv3: 0,
                opcode: 0x2,
                payload: new Uint8Array(10).fill(2)
            });
        } catch (err) {
            errorMessage = 
                err.message;
        }
        expect(errorMessage).toEqual(
            'Fragmented message already started'
        );
    });
    
    it(
        'throws an error if finish() is called before start() is called'
    , function () {
    
        const store = 
            new FragmentedMessageStore();
        const initialFrame = {
            rsv1: 0,
            rsv2: 0,
            rsv3: 0,
            opcode: 0x2,
            mask: 0,
            payload: new Uint8Array(8).fill(1)
        };
        let errorMessage1;
        try {
            store.start(
                initialFrame
            );
            const message1 = 
                store.finish();
            expect(message1).toEqual(
                initialFrame
            );
            const message2 = 
                store.finish();
        } catch (err) {
            errorMessage1 = 
                err.message;
        }
        expect(errorMessage1).toEqual(
            'No fragmented message'
        );
        let errorMessage2;
        try {
            const message3 = 
                store.finish();
        } catch (err) {
            errorMessage2 = 
                err.message;
        }
        expect(errorMessage2).toEqual(
            'No fragmented message'
        );
    });
    
});