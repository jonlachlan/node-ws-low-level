/*
 * Copyright (c) Jon Lachlan 2020
*/

/*
 * Implements set(), get() and isSet(), in order to store and retrieve a 
 * partial frame in-memory in a scope above the async generator returned in 
 * parseWebsocketFramesFactory, in place of reassigning a single variable.
*/

export default function PartialFrameStore () {
    const array = [];
    
    return {
        set (partialFrame) {
            if(array.length === 0) {
                array.push(partialFrame);
            } else {
                throw new Error('partial frame is already set');
            }
        },
        get () {
            if(array.length) {
                return array.shift();
            } else {
                throw new Error('partial frame has not been set');
            }
        },
        isSet () {
            return Boolean(array.length);
        }
    };
}

