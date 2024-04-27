/*
 * Copyright (c) Jon Lachlan 2020
*/

import stream from 'stream';
import sendFactory from './sendFactory.js';
import prepareWebsocketFrame from './prepareWebsocketFrame';

describe(
    'sendFactory'
, function() {

    it(
        'throws an error if \`socket\` is not an instance of stream.Duplex'
    , function () {
    
        let errorsCount = 
            0;
        try {
            const send1 = 
                sendFactory();
        } catch (error) {
            expect(error.message).toEqual(
                'socket argument of sendFactory is not an instance of stream.Duplex'
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
            const send2 = 
                sendFactory(socket);
        } catch (error) {
            throw error;
            errorsCount++;
        }
        expect(errorsCount).toEqual(0);
    });
    
    it(
        'returns a function'
    , function () {
        
        const socket = 
            new class extends stream.Duplex {
                
                _read () {
                
                }
            };
        const send = 
            sendFactory(socket);
        expect(typeof send).toEqual('function');
    });

    describe(
        'returned function'
    , function () {
        
        it(
            'throws an error if frame is not an instance of Uint8Array'
        , function () {
            
            const socket = 
                new class extends stream.Duplex {
                
                    _read () {
                
                    }
                    
                    _write() {
                    
                    }
                };
            const send = 
                sendFactory(socket);
            
            let errorsCount = 
                0;
            
            try {
                send(
                    prepareWebsocketFrame(
                        new Uint8Array(0)
                    )
                );
            } catch(error) {
                errorsCount++;
            }
            expect(errorsCount).toEqual(0);
            errorsCount = 
                0;
            
            try {
                send();
            } catch(error) {
                expect(error.message).toEqual(
                    'frame argument must be a Uint8Array'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
            errorsCount = 
                0;
            
            try {
                send(
                    new Uint16Array(0)
                );
            } catch(error) {
                expect(error.message).toEqual(
                    'frame argument must be a Uint8Array'
                );
                errorsCount++;
            }
            expect(errorsCount).toEqual(1);
        });
    
        it(
            'throws an error if \`isUtf8\` is not a Boolean'
        , function () {
            
            const socket = 
                new class extends stream.Duplex {
                
                    _read () {
                
                    }
                    
                    _write () {
                    
                    }
                };
            const send = 
                sendFactory(socket);
            
            let errorsCount = 
                0;
            
            try {
                send(
                    new Uint8Array(0),
                    {
                        isUtf8: false
                    }
                );
            } catch(error) {
                errorsCount++;
            }
            expect(errorsCount).toEqual(0);
            errorsCount = 
                0;
            
            try {
                send(
                    new Uint8Array(0),
                    {
                        isUtf8: true
                    }
                );
            } catch(error) {
                errorsCount++;
            }
            expect(errorsCount).toEqual(0);
            errorsCount = 
                0;
        });
    
        it.todo(
            'successfully sends a message to a client'
        );
    });
    
});