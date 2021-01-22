// Node.js WebSocket server script
const http = require('http');
const WebSocketServer = require('websocket').server;
const server = http.createServer();
server.listen(9898);
const wsServer = new WebSocketServer({
    httpServer: server
});
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    connection.on('message', function(message) {
      console.log('Received Message:', message.utf8Data);
      var number = Math.round(Math.random() * 0xffffff);
      connection.sendUTF('Hi this is WebSocket server ' + number.toString());
    });
    connection.on('close', function(reasonCode, description) {
        console.log('Client has disconnected.');
    });
});
