/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function prepareCloseFramePayload (
    {
        code /* Integer <Number> from 1000 to 65536 */,
        reason = '' /* optional UTF-8 <String> */,
    
        /* for advanced usage */
        extensionData = new Uint8Array(0) /* optional <Uint8Array> */
    } = {}
) {

    if(typeof code !== 'number' || code - code.toFixed(0) > 0) {
        throw new Error(
            'code must be an integer number'
        );
    } else if(code < 1000 || code >= 65536) {
        throw new Error(
            'code is not in the acceptable range 1000 <= x < 65536'
        );
    }
    
    if(typeof reason !== 'string')
        throw new Error(
            'reason must be a string'
        );
    
    const encoder = 
        new TextEncoder('utf-8');
    const reasonUint8Array = 
        new Uint8Array(
            encoder.encode(reason)
        );
    const closeMessagePayload = 
        new Uint8Array(
            extensionData.length + 2 + 
            reasonUint8Array.length
        );

    /* 
     * Per RFC 6455,
     *
     * /Payload data/ = /Extension data/ /code/ /reason/
     *
     * See sections 5.1, 5.5.1, 7.1.5 and 7.1.6
     * https://tools.ietf.org/html/rfc6455
    */
    
    closeMessagePayload.set(
        extensionData,
        0 /* offset */
    );

    // Status code is a two-byte unsigned integer
    closeMessagePayload.fill(
        // first byte of status code integer
        code >>> 8 /* drop rightmost 8 bits */,
        extensionData.length /* start position */,
        extensionData.length + 1 /* end position */
    );
    closeMessagePayload.fill(
        // second byte of status code integer
        code % (Math.pow(2, 8)) /* keep rightmost 8 bits */,
        extensionData.length + 1 /* start position */,
        extensionData.length + 2 /* end position */
    );

    closeMessagePayload.set(
        reasonUint8Array,
        extensionData.length + 2 /* offset */
    );
    return closeMessagePayload;
}