/*
 * Copyright (c) Jon Lachlan 2020
*/

export default function FragmentedMessageStore () {
    
    const messageStore = 
        [];
    const payloads = 
        [];
        
    return new class {
        
        start ({
            rsv1,
            rsv2,
            rsv3,
            opcode,
            mask,
            payload
        } = {}) {
            
            if(messageStore.length !== 0)
                throw new Error(
                    'Fragmented message already started'
                );
                
            if(
                rsv1 !== 0
                &&
                rsv1 !== 1    
            )
                throw new Error(
                    'rsv1 is not an integer between 0 and 1'
                );

            if(
                rsv2 !== 0
                &&
                rsv2 !== 1                
            )
                throw new Error(
                    'rsv2 is not an integer between 0 and 1'
                );
                
            if(
                rsv3 !== 0
                &&
                rsv3 !== 1                
            )
                throw new Error(
                    'rsv3 is not an integer between 0 and 1'
                );
                
            if(
                typeof opcode !== 'number'
                ||
                opcode < 0x0
                ||
                opcode > 0xF
                ||
                Number(opcode).toFixed(0) != opcode
            )
                throw new Error(
                    'opcode is not a hexidecimal number between 0x0 and 0xF'
                );
                
            if(
                mask !== 0
                &&
                mask !== 1
            )
                throw new Error(
                    'mask is not an integer between 0 and 1'
                );
                
            if(!(payload instanceof Uint8Array))
                throw new Error(
                    'payload is not an instance of Uint8Array'
                );
                            
            messageStore.push({
                rsv1,
                rsv2,
                rsv3,
                opcode,
                mask
            });
            payloads.push(
                payload
            );
        }
        
        addPayload (payload) {
            payloads.push(
                payload
            );
        }
        
        isStarted () {
            return Boolean(messageStore.length);
        }
        
        finish () {
            if(messageStore.length !== 1) {
                throw new Error(
                    'No fragmented message'
                );
            }
            const message = messageStore.shift();
            message.payload = new Uint8Array(
                payloads.reduce(
                    (
                        length, 
                        payload
                    ) => length + payload.length
                , 0 /* initialValue */)
            );
            payloads.reduce(
                (
                    offset /* accumulator */,
                    payload,
                    index
                ) => {
                    message.payload.set(
                        payload,
                        offset
                    );
                    return offset + payloads[index].length;
                }
            , 0 /* initialValue */);
            return message;
        }
        
    }
}
