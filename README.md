# ws-low-level

ws-low-level provides low-level functions to create a WebSocket server in Node.JS. It is promise-based and easy to get 
started with -- just use the example below.

The library is flexible and low-level enough to make your own customizations like: 
* customized messages on a connection close
* adding a rate limiter
* routes and endpoints 
(e.g., by parsing`request.url`) 
* adding support for WebSocket extension(s)
* inspecting a ping message

## Example WebSocket server

Here is a complete example of a Node.JS WebSocket server using ws-low-level. For example, create a file named 
websocket-server.js, place this code in the file, and run `node websocket-server.js`.

```JavaScript
// websocket-server.js
import http from 'http';
import {
    sendHandshake,
    getMessagesFactory,
    sendFactory,
    prepareWebsocketFrame,
    prepareCloseFramePayload
} from 'ws-low-level';

const httpServer = http.createServer(
    function (
        request /* <http.IncomingMessage> */,
        response /* <http.ServerResponse> */
    ) {
        // Handle HTTP messages by verbs like GET and POST (not part of ws-low-level)
    }
);

httpServer.on('upgrade', function (
    request /* <http.IncomingMessage> */,
    socket /* <stream.Duplex> */ ,
    head /* <Buffer> websocket header */
) {
    console.log('upgrade');

    const send =
        sendFactory(socket);
    const getMessages =
        getMessagesFactory(
            socket, 
            { 
                maxInMemoryStoreSize: 2147483648 // 2 GB 
            }
        );

    (async () => {
        for await (
            const {
                payload /* <Promise> <Uint8Array> */,
                opcode /* Integer <Number> from 0 to 15 */,
                rsv1 /* Integer <Number> from 0 to 1 */,
                rsv2 /* Integer <Number> from 0 to 1 */,
                rsv3 /* Integer <Number> from 0 to 1 */,
                mask /* Integer <Number> from 0 to 1 */
            } of getMessages()
            ) {

            if (
                payload.length
                &&
                mask === 0
            ) {
                // No masking from client, close the connection with a status code
                send(
                    prepareWebsocketFrame(
                        prepareCloseFramePayload({
                            code: 1002,
                            reason: 'Websocket payload from client was not masked.'
                        }),
                        {
                            opcode: 0x8 /* Close */
                        }
                    )
                );
            }

            switch (opcode) {
                case 0x1:
                    // Text
                    const decoder =
                        new TextDecoder("utf-8");

                    console.log(
                        `received message ${decoder.decode(payload)}`
                    );

                    break;

                case 0x2:
                    // Binary
                    console.log(
                        `received message with payload length ${payload.length}`
                    );

                    break;

                case 0x9:
                    // Ping, respond with Pong
                    send(
                        prepareWebsocketFrame(
                            payload,
                            {
                                opcode: 0xA /* Pong */
                            }
                        )
                    );

                    break;

                case 0xA:
                    // Pong
                    console.log("Pong");

                    break;

                case 0x8:
                    // Close
                    console.log("Connection closed.");

                    break;

                default:
                    console.log(
                        `received message with opcode ${opcode} payload length ${payload.length}`
                    );
            }
        }
    })();

    const headers =
        [] /* Optional <Array> of well-formed header strings */;

    sendHandshake(
        request,
        socket,
        headers
    );

    // Send Ping
    send(
        prepareWebsocketFrame(
            new Uint8Array(0),
            {
                opcode: 0x9 /* Ping */
            }
        )
    );

    const encoder =
        new TextEncoder('utf-8');

    // Send UTF-8 encoded message
    send(
        prepareWebsocketFrame(
            new Uint8Array(
                encoder.encode("Hello from the WebSocket server.")
            ),
            {
                isUtf8: true
            }
        )
    );
});

httpServer.listen(3000);
```

Here is example html (place in an .html file like index.html) that would connect to the example server:


```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ws-low-level example webpage</title>
</head>
<body>
    <script>
        let ws = new WebSocket("ws://localhost:3000/");
        ws.onopen = function() {
            ws.send("Hello from the WebSocket");
        }
    </script>
</body>
</html>
```

## Imports

The library exports the following functions. They can be imported and used in your Node webserver (see the example 
above).

### sendHandshake

```javascript
function sendHandshake (
    request /* <http.IncomingMessage> */, 
    socket /* <stream.Duplex> */,
    headers /* <Array> of well-formatted http header strings */
) {
    // ...
}
```
Send the handshake to establish the WebSocket connection. Pass the `request` and `socket` from `http.on('upgrade')`, and 
optionally pass an array of header strings, for example to include a `sec-websocket-extension` or 
`sec-websocket-protocol`.

### getMessagesFactory
```javascript
function getMessagesFactory (
    socket /* <stream.Duplex> */,
    /* Optional options object */
    {
        /* Optional <Integer> of max in-memory message store size, in bytes. This is not enforced 
         * on small messages, which do not necessarily make use of the in-memory store class 
        */
        maxInMemoryStoreSize 
    } = {}
) {
    // ...
}
```

Returns an async generator `getMessages`. Pass the `socket` object from `http.on('upgrade')`. The factory should only be
called once per endpoint/route.

### sendFactory

```javascript
function sendFactory (
    socket /* <stream.Duplex> */
) {
    //...
}
```

Returns a function `send` that accepts a frame. (Prepare a frame with the function `prepareWebsocketFrame` from 
ws-low-level, below). Pass the `socket` object from `http.on('upgrade')`. The factory can be called multiple times to make multiple `send` functions.

### prepareWebsocketFrame

```javascript
function prepareWebsocketFrame (
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
    //...
}
```

Make a WebSocket frame to prepare it for sending. Provide the payload, which is by default encoded as a binary frame
(opcode 2). Optionally provide an options object `{ isUtf8: true }` to designate that the payload is encoded as UTF-8 
text (opcode 1). Other opcodes can be optionally provided by providing an `opcode` in the options object. The `fin` bit
(for fragmenting messages) and the `rsv1`, `rsv2` and `rsv3` bits (for extensions) can also be set.

### prepareCloseFramePayload

```javascript
 function prepareCloseFramePayload (
    {
        code /* Integer <Number> from 1000 to 65536 */,
        reason = '' /* optional UTF-8 <String> */,
    
        /* for advanced usage */
        extensionData = new Uint8Array(0) /* optional <Uint8Array> */
    } = {}
) {
    // ...
}
```

Prepare the payload of a close frame. Provide a code and optionally a reason. Optionally provide extension data.

## Copyright

Copyright (c) 2024 Jon Lachlan.

## License

GNU Public License v.3

https://www.gnu.org/licenses/gpl-3.0.en.html