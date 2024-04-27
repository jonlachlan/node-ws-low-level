/*
 * Copyright (c) Jon Lachlan 2020
*/


/*
 * AwaitQueue implements push() and shift(), similar to an Array. push() 
 * accepts an iterable of values and adds it to the end of the queue, and 
 * shift() returns a Promise and removes it from the beginning of the 
 * queue.
*/
    
export default function AwaitQueue () {
    const pushArray = [];
    const awaitArray = [];
    
    function clearinghouse () {
        while(
            awaitArray.length 
            && 
            pushArray.length
        ) {
            awaitArray.pop()(
                pushArray.shift()
            );
        }
    }
    
    
    return {
        
        push: (...values) => {
            
            pushArray.push(
                ...values
            );
            
            clearinghouse();
        },
    
        shift: async () => {
            return new Promise(
                (resolve, reject) => {
                    if(
                        pushArray.length
                    ) {
                        resolve(
                            pushArray.shift()
                        );
                    } else {
                        awaitArray.unshift(
                            resolve
                        );
                        
                        clearinghouse();
                    }
                }
            )
        }
    }
}