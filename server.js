const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

let controls = {
    "autoLight": 1,
    "light": 0,
    "parkingSlot1": 0,
    "parkingSlot2": 0,
}
let alerts = {
    "parkingSlot1": 0,
    "parkingSlot2": 0,
}

wss.on('connection', (ws) => {
    console.log('A client connected');
    
    let controlKeys = Object.keys(controls);
    controlKeys.forEach(function(control){
        ws.send('control:'+control+':'+controls[control]);
    });

    let alertKeys = Object.keys(alerts);
    alertKeys.forEach(function(alert){
        ws.send('alert:'+alert+':'+alerts[alert]);
    });

    ws.on('message', (message) => {
        if (Buffer.isBuffer(message)) {
            message = message.toString();
        }
        let data = message.split(":");
        if(data[0] == "toggle") {
            controls[data[1]] = controls[data[1]] == 1 ? 0 : 1;
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("control:"+data[1]+":"+controls[data[1]]);
                }
            });
        } 
        else if(data[0] == "alert") {
            alerts[data[1]] = data[2];
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("alert:"+data[1]+":"+alerts[data[1]]);
                }
            });
        } 
        else {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }

    });

    ws.on('close', () => {
        console.log('A client disconnected');
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

console.log('WebSocket server is running on ws://localhost:3000');