/*
 * Copyright (c) Jon Lachlan 2020
*/

import AwaitQueue from './AwaitQueue.js';

describe('AwaitQueue', function() {

    test(
        'returns a Promise when shift() is called'
    , async function () {
        
        const queue = 
            new AwaitQueue();
        const pull1 = 
            queue.shift();
        expect(pull1 instanceof Promise).toEqual(true);

        queue.push(1);
        expect(await pull1).toEqual(1);
        
        queue.push(2);
        const pull2 = 
            queue.shift();
        expect(pull2 instanceof Promise).toEqual(true);
        expect(await pull2).toEqual(2);
    });
    
    test(
        'accepts one or more values when push() is called'
    , async function () {
        
        const queue = 
            new AwaitQueue();
        queue.push(1);
        queue.push(2, 3, 4);
        expect(await queue.shift()).toEqual(1);
        expect(await queue.shift()).toEqual(2);
        expect(await queue.shift()).toEqual(3);
        expect(await queue.shift()).toEqual(4);
    });

    test(
        'resolves all values submitted to push() to the Promises returned ' +
        'by shift()'
    , async function () {
        
        const queue = 
            new AwaitQueue();
        const pull1 = 
            queue.shift();
        queue.push(1);
        expect(await pull1).toEqual(1);
        
        queue.push(2);
        const pull2 = 
            queue.shift();
        expect(await pull2).toEqual(2);
    });
    
});