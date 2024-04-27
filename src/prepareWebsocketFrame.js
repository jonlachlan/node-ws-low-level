/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function prepareWebsocketFrame (
    payload /* <Uint8Array> */,
    /* Optional options object */
    {
        isUtf8 = false /* <Boolean> */,
        
        /* For advanced usage */
        opcode /* Integer <Number> between 0 and 15 */,
        fin = 1 /* Integer <Number> between 0 and 1 */,
        rsv1 = 0 /* Integer <Number> between 0 and 1 */,
        rsv2 = 0 /* Integer <Number> between 0 and 1 */,
        rsv3 = 0 /* Integer <Number> between 0 and 1 */
    } = {}
) {

    if(!(payload instanceof Uint8Array))
        throw new Error(
            'payload not an instance of Uint8Array'
        );
        
    if(opcode !== undefined && 
        (
            typeof(opcode) !== 'number'
            ||
            (opcode < 0x0 || opcode > 0xF)
            ||
            (opcode.toFixed() < opcode)
            ||
            (opcode.toFixed() > opcode)
        )
    )
        throw new Error(
            'opcode not an integer between 0 and 15'
        );
    
    if(
        typeof(fin) !== 'number'
        ||
        (fin < 0 || fin > 1)
        ||
        (fin.toFixed() < fin)
        || 
        (fin.toFixed() > fin)
    ) 
        throw new Error(
            'fin is not an integer between 0 and 1'
        );
        
    if(
        typeof(rsv1) !== 'number'
        ||
        (rsv1 < 0 || rsv1 > 1)
        ||
        (rsv1.toFixed() < rsv1)
        || 
        (rsv1.toFixed() > rsv1)
    ) 
        throw new Error(
            'rsv1 is not an integer between 0 and 1'
        ); 
        
   if(
        typeof(rsv2) !== 'number'
        ||
        (rsv2 < 0 || rsv2 > 1)
        ||
        (rsv2.toFixed() < rsv2)
        || 
        (rsv2.toFixed() > rsv2)
    ) 
        throw new Error(
            'rsv2 is not an integer between 0 and 1'
        ); 
    
    if(
        typeof(rsv3) !== 'number'
        ||
        (rsv3 < 0 || rsv3 > 1)
        ||
        (rsv3.toFixed() < rsv3)
        || 
        (rsv3.toFixed() > rsv3)
    ) 
        throw new Error(
            'rsv3 is not an integer between 0 and 1'
        ); 

    let extended_payload_length_bytes;
    let payload_len;
    if(payload.length <= 125) {
        // Fits in 7 bits
        payload_len = payload.length;
        extended_payload_length_bytes = 0;
    } else if(payload.length >= 65536) {
        // Won't fit in 16 bits, use 63 bits
        payload_len = 127;
        extended_payload_length_bytes = 8;
    } else {
        // Fits in 16 bits
        payload_len = 126;
        extended_payload_length_bytes = 2;
    }
    
    // length of a Uint8Array is measured in bytes
    const preparedMessage = new Uint8Array(
        2 + extended_payload_length_bytes + payload.length
    );

    // Set first byte (8 bits)
    
    // First four (4) bits of first byte
    preparedMessage.fill(
        (
            (fin) * Math.pow(2, 7)
            +
            (rsv1) * Math.pow(2, 6)
            +
            (rsv2) * Math.pow(2, 5)
            +
            (rsv3) * Math.pow(2, 4)
        ),
        0 /* start position */, 
        1 /* end position */
    );
    
    // Second four (4) bits of first byte
    if(opcode !== undefined) {
        preparedMessage.fill(
            preparedMessage[0] + opcode, 
            0 /* start position */, 
            1 /* end position */
        );
    } else if(isUtf8) {
        // set opcode to 1 (text frame), unless another opcode is provided
        preparedMessage.fill(
            preparedMessage[0] + 1, 
            0 /* start position */, 
            1 /* end position */
        );
    } else {
        // set opcode to 2 by default (binary frame)
        preparedMessage.fill(
            preparedMessage[0] + 2, 
            0 /* start position */, 
            1 /* end position */
        );
    }
    
    /*
     * Set second byte. Because we are not masking (server-to-client messages 
     * are not masked), the leftmost bit (MASK) of 8 through 15 will be 0, and 
     * the 7 remaining are payload_len, thus we can use the value of 
     * payload_len.
    */
    preparedMessage.fill(
        payload_len, 
        1 /* start position */, 
        2 /* end position */
    );    
    
    // Set extended-payload-length
    const extended_payload_length = 
        new Uint8Array(extended_payload_length_bytes);
        
    // turn decimal value of payload length into Uint8Array
    let remaining = 
        payload.length;
    for(
        let i = 1; 
        i <= extended_payload_length_bytes; 
        i++
    ) {
        // set value for each byte, from right to left
        extended_payload_length.fill(
            (
                (
                    remaining 
                    % 
                    (Math.pow(2, 8 * i)) /* next highest bit from this byte */
                ) 
                >>> (8 * (i - 1)) /* move past bytes already filled */
                
            ) /* value */,
            extended_payload_length.length - i /* start position */,
            (extended_payload_length.length - i) + 1 /* end position */
        );
        remaining -= 
            remaining % (Math.pow(2, 8 * i)); /* subtract value just counted */
    }
    
    preparedMessage.set(
        extended_payload_length, 
        2 /* offset */
    );
    
    // Set payload-data
    preparedMessage.set(
        payload, 
        2 + extended_payload_length_bytes /* offset */
    );
    
    return preparedMessage /* <Uint8Array> */;
}