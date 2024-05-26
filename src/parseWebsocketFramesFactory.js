/*
 * Copyright (c) Jon Lachlan 2020
*/

import uint2ArrayFromUint8Value from './uint2ArrayFromUint8Value.js';
import PartialFrameStore from './PartialFrameStore.js';

export default function parseWebsocketFramesFactory (
    /* Optional options object */
    {
        /*
         * Optional <Integer> of max in-memory message store size, in bytes. This is not enforced
         * on small messages, which do not necessarily make use of one of the in-memory store
         * (PartialFrameStore).
        */
        maxInMemoryStoreSize
    } = {}
) {
    
    const previousPartialFrame = 
        new PartialFrameStore();
    
    return async function* parseMore (
        buffer /* <Uint8Array> or nodejs <Buffer> or null */
    ) {
        
        if(buffer === null) {
            // read() from socket.Duplex can return null
            return;
        } 
        /*
         * not implemented
         
         else if(
            (buffer instanceof Uint8Array) !== true
        ) {
            throw new Error(
                'buffer argument is not an instance of Uint8Array or null'
            );
        }
        
        * ^
        */
        
        let messagesUint8;
        
        if(previousPartialFrame.isSet()) {
            const partialFrame = 
                previousPartialFrame.get();
            if(partialFrame.rest) {
                // partialFrame has no parsing saved, prepend to buffer
                
                messagesUint8 = 
                    new Uint8Array(
                        partialFrame.rest.length 
                        + 
                        buffer.length
                    );
                messagesUint8.set(
                    partialFrame.rest
                );
                messagesUint8.set(
                    buffer, 
                    partialFrame.rest.length /* offset */
                );
            } else {
                // partialFrame has partially filled payload
                
                if(
                    buffer.length < 
                    (
                        partialFrame.payload.length - 
                        partialFrame.payload_length_filled
                    )
                ) {
                    // not enough data to complete partial frame
                    
                    partialFrame.payload.set(
                        buffer,
                        partialFrame.payload_length_filled /* offset */
                    );
                    partialFrame.payload_length_filled += 
                        buffer.length;
                    previousPartialFrame.set(partialFrame);
                    // exit parseMore
                    return;
                } else {
                    // complete the partial frame and yield
                    
                    yield new Promise (
                        (resolve, reject) => {
                        
                            partialFrame.payload.set(
                                buffer.slice(
                                    0 /* start */,
                                    (
                                        partialFrame.payload.length - 
                                        partialFrame.payload_length_filled
                                    ) /* end */
                                ),
                                partialFrame.payload_length_filled /* offset */
                            );
                    
                            if(partialFrame.mask === 1) {
                                for (
                                    let i = 0;
                                    i < partialFrame.payload.length;
                                    i++
                                ) {
                                    partialFrame.payload.fill(
                                        (
                                            partialFrame.payload[i]
                                            ^ /* XOR */
                                            partialFrame.masking_key[(i % 4)]
                                        )
                                        , i /* start position */
                                        , i + 1 /* end position */
                                    );
                                }
                            }
                            
                            resolve({
                                fin: partialFrame.fin /* Integer <Number> from 0 to 1 */,
                                rsv1: partialFrame.rsv1 /* Integer <Number> from 0 to 1 */,
                                rsv2: partialFrame.rsv2 /* Integer <Number> from 0 to 1 */,
                                rsv3: partialFrame.rsv3 /* Integer <Number> from 0 to 1 */,
                                opcode: partialFrame.opcode /* Integer <Number> from 0 to 15 */,
                                mask: partialFrame.mask /* Integer <Number> from 0 to 1 */,
                                payload: partialFrame.payload /* <Uint8Array> */
                            });
                        }
                    );
                    
                    messagesUint8 = 
                        buffer.slice(
                            (
                                partialFrame.payload.length - 
                                partialFrame.payload_length_filled
                            ) /* begin */,  
                            buffer.length + 1 /* end */
                        );
                }
            }
        } else {
            messagesUint8 = 
                buffer;
        }
        
        let currentFrameStartIndex = 
            0;
        
        while(true) {
    
            /*
             * Parse a WebSocket message based on The WebSocket Protocol, as specified by 
             * the Request For Comments 6455 (RFC 6455) by the IETF, see 
             * https://tools.ietf.org/html/rfc6455.
             *
             * Per Section 5.2 of the specification, a base frame takes the following 
             * form, in terms of bits (1's and 0's). The visualization is wrapped at the 
             * 32nd bit:

            --------------------------- as published in RFC 6455 ---------------------------


                  0                   1                   2                   3
                  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
                 +-+-+-+-+-------+-+-------------+-------------------------------+
                 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
                 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
                 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
                 | |1|2|3|       |K|             |                               |
                 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
                 |     Extended payload length continued, if payload len == 127  |
                 + - - - - - - - - - - - - - - - +-------------------------------+
                 |                               |Masking-key, if MASK set to 1  |
                 +-------------------------------+-------------------------------+
                 | Masking-key (continued)       |          Payload Data         |
                 +-------------------------------- - - - - - - - - - - - - - - - +
                 :                     Payload Data continued ...                :
                 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
                 |                     Payload Data continued ...                |
                 +---------------------------------------------------------------+


            ------------------------------- end of quotation -------------------------------

            */

            // Check for partial frame
            if(
                (messagesUint8.length - currentFrameStartIndex) < 2
            ) {
                previousPartialFrame.set({
                    rest: messagesUint8.slice(
                        currentFrameStartIndex /* start */,
                        messagesUint8.length /* end */
                    )
                });
                // exit parseMore
                return;
            }
            
            // First 16 bits (2 bytes) are always part of base frame
            
            const first_16_bits = 
                [
                    ...uint2ArrayFromUint8Value(messagesUint8[currentFrameStartIndex + 0]),
                    ...uint2ArrayFromUint8Value(messagesUint8[currentFrameStartIndex + 1])
                ];
            
            /* is final frame */
            const fin = 
                first_16_bits[0];
    
            /* reserved bits */
            const rsv1 = 
                first_16_bits[1];
            const rsv2 = 
                first_16_bits[2];
            const rsv3 = 
                first_16_bits[3];

            const opcode = 
                parseInt((
                    first_16_bits
                        .slice(
                            4 /* start */, 
                            8 /* end */
                        )
                        .join('')
                ), 2 /* base */);

            const mask = 
                first_16_bits[8];

            const payload_len = 
                parseInt((
                    first_16_bits
                        .slice(
                            9 /* start */, 
                            17 /* end */
                        )
                        .join('')
                ), 2 /* base */);

            // Parse for extended payload length

            let has_extended_payload_length_16;
            let has_extended_payload_length_63;
            let payload_length_value;

            switch(payload_len) {

                /*
                 * The 7 bits of payload_len can be used to reserve more bits for extended 
                 * payload length, in which case payload_len is no longer used to determine 
                 * value
                */

                case 126:
                    /*
                     * 2 bytes reserved for extended payload length
                    */
                    
                    has_extended_payload_length_16 = 
                        true;
                    payload_length_value =
                        parseInt((
                            [
                                // 16 bits (2 bytes) from index 16 to 31
                                ...uint2ArrayFromUint8Value(messagesUint8[currentFrameStartIndex + 2]),
                                ...uint2ArrayFromUint8Value(messagesUint8[currentFrameStartIndex + 3])
                            ].join('')
                        ), 2 /* base */);

    
                    break;

                case 127:
                    /*
                     * 8 bytes reserved for extended payload length (63 bits of value)
                    */

                    // the first bit out of the 64 must be zero
                    if(
                        uint2ArrayFromUint8Value(messagesUint8[currentFrameStartIndex + 2])[0] === 
                        1
                    )
                        throw new Error(
                            `Most significant bit of a 64-bit extended payload length must be zero`
                        );
        
                    has_extended_payload_length_63 = 
                        true;
                    payload_length_value =
                        parseInt((
                            [
                                // 64 bits (8 bytes) from index 16
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 2]
                                ), // 1
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 3]
                                ), // 2
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 4]
                                ), // 3
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 5]
                                ), // 4
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 6]
                                ), // 5
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 7]
                                ), // 6
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 8]
                                ), // 7
                                ...uint2ArrayFromUint8Value(
                                    messagesUint8[currentFrameStartIndex + 9]
                                ) // 8
                            ].join('')
                        ), 2 /* base */);

                    break;

                default:
                    payload_length_value = 
                        payload_len;

            }

            let 
                payload_start_index,
                masking_key_octets_start_index;
                
            switch(mask) {
            
                case 1:
                    if(has_extended_payload_length_16) {
                        masking_key_octets_start_index = 
                            4;
                    } else if(has_extended_payload_length_63) {
                        masking_key_octets_start_index = 
                            10;
                    } else {
                        // starting from end of payload_len
                        masking_key_octets_start_index = 
                            2;
                    }

                    // Masking key is 32 bits, i.e., 4 octets (4 bytes)
                    payload_start_index = 
                        masking_key_octets_start_index + 4;
                    break;

                case 0:                    
                    if(has_extended_payload_length_16) {
                        payload_start_index = 
                            4;
                    } else if(has_extended_payload_length_63) {
                        payload_start_index = 
                            10;
                    } else {
                        // starting from end of payload_len
                        payload_start_index = 
                            2;
                    }
                    break;
            }
            
            // Check for partial frame
            if(
                (messagesUint8.length - currentFrameStartIndex) < 
                (payload_start_index + payload_length_value)
            ) {
                if(
                    (messagesUint8.length - currentFrameStartIndex) < payload_start_index
                ) {
                    previousPartialFrame.set({
                        rest: messagesUint8.slice(
                            currentFrameStartIndex /* start */,
                            messagesUint8.length /* end */
                        )
                    });
                    // exit parseMore
                    return;
                } else {
                    // Payload is only incomplete part of frame
                    if (
                        maxInMemoryStoreSize != undefined
                        &&
                        payload_length_value > maxInMemoryStoreSize
                    ) {
                        throw new Error(
                            'Message max in-memory store size exceeded'
                        );
                    }

                    const payload = 
                        new Uint8Array(payload_length_value);
                    payload.set(
                        messagesUint8.slice(
                            currentFrameStartIndex + payload_start_index,
                            messagesUint8.length
                        )
                    );
                    previousPartialFrame.set({
                        fin /* Integer <Number> from 0 to 1 */,
                        rsv1 /* Integer <Number> from 0 to 1 */,
                        rsv2 /* Integer <Number> from 0 to 1 */,
                        rsv3 /* Integer <Number> from 0 to 1 */,
                        opcode /* Integer <Number> from 0 to 15 */,
                        mask /* Integer <Number> from 0 to 1 */,
                        masking_key: messagesUint8.slice(
                            currentFrameStartIndex + masking_key_octets_start_index,
                            currentFrameStartIndex + masking_key_octets_start_index + 4
                        ) /* <Uint8Array> */,
                        payload /* <Uint8Array> */,
                        payload_length_filled: (
                            messagesUint8.length - currentFrameStartIndex - payload_start_index
                        ) /* Integer <Number> */,
                        rest: undefined /* undefined or Uint8Array */
                    });
                    // exit parseMore
                    return;
                }
            }
            
            async function determinePayload ({
                payload_length_value,
                payload_start_index,
                currentFrameStartIndex,
                masking_key_octets_start_index
            }) {
                return new Promise(
                    (resolve, reject) => {
                        // Determine payload

                        const payload = 
                            new Uint8Array(payload_length_value);

                        if(mask === 1) {

                            /*
                             * Demasking per Section 5.3 of the specification: 

                            --------------------------- as published in RFC 6455 ---------------------------


                               To convert masked data into unmasked data, or vice versa, the following 
                               algorithm is applied.  The same algorithm applies regardless of the 
                               direction of the translation, e.g., the same steps are applied to mask the 
                               data as to unmask the data.

                               Octet i of the transformed data ("transformed-octet-i") is the XOR of octet 
                               i of the original data ("original-octet-i") with octet at index i modulo 4 
                               of the masking key ("masking-key-octet-j"):

                                 j                   = i MOD 4
                                 transformed-octet-i = original-octet-i XOR masking-key-octet-j


                            ------------------------------- end of quotation -------------------------------

                            */

                            for (
                                let i = 0;
                                i < payload_length_value;
                                i++
                            ) {
                                payload.fill(
                                    (
                                        messagesUint8[currentFrameStartIndex + i + payload_start_index]
                                        ^ /* XOR */
                                        messagesUint8[currentFrameStartIndex + masking_key_octets_start_index + 
                                            (i % 4)]
                                    )
                                    , i /* start position */
                                    , i + 1 /* end position */
                                );
                            } 
                        } else {
                            // no masking

                            payload.set(
                                messagesUint8.slice(
                                    currentFrameStartIndex + payload_start_index /* begin */,
                                    (
                                        currentFrameStartIndex + payload_start_index + payload_length_value
                                    ) /* end */
                                )
                            );
                        }

                        resolve(payload);
                    }
                )
            }
            
            yield new Promise(
                async (resolve, reject) => {
                    resolve({
                        fin /* Integer <Number> from 0 to 1 */,
                        rsv1 /* Integer <Number> from 0 to 1 */,
                        rsv2 /* Integer <Number> from 0 to 1 */,
                        rsv3 /* Integer <Number> from 0 to 1 */,
                        opcode /* Integer <Number> from 0 to 15 */,
                        mask /* Integer <Number> from 0 to 1 */,
                        payload: await determinePayload({
                            payload_length_value,
                            payload_start_index,
                            currentFrameStartIndex,
                            masking_key_octets_start_index
                        }) /* <Uint8Array> */
                    })
                }
            );
        
        
            // Check length for more frames and run again
        
            if(
                (messagesUint8.length - currentFrameStartIndex) > 
                (
                    payload_start_index + payload_length_value
                )
            ) {
                currentFrameStartIndex += 
                    (payload_start_index + payload_length_value);
            } else {
                // exit while loop
                break;
            }
        }
    };
}

