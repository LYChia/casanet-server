import SignalR from 'node-signalr';
import readline from 'readline';
import util from 'util'

const consoleIO = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = util.promisify(consoleIO.question).bind(consoleIO);

const client = new SignalR.client("http://localhost:8080/signalr", ["bluetoothDeviceHub"])


client.on('connected', async () => {
    console.log('SignalR client connected.')
    //client.connection.hub.invoke("myHub", "Send", "rz", "123456AA");
    //client.connection.hub.call("myHub", "Send", "rz", "123456AA");
    // try {
    //     const result = await client.connection.hub.call("deviceHub", "DiscoverBluetoothDevices");
    //     console.log(result)
    //     //client.connection.hub.invoke("deviceHub", "getBluetoothDevices");
    // }
    // catch (err) {
    //     console.error(err)
    // }
})
client.on('reconnecting', (count) => {
    console.log(`SignalR client reconnecting(${count}).`)
})
client.on('disconnected', (code) => {
    console.log(`SignalR client disconnected(${code}).`)
})
client.on('error', (code, ex) => {
    console.log(`SignalR client connect error: ${code}.`)
})

// client.connection.hub.on('myHub', 'addMessage', (name, message) => {
//     console.log('receive:', name, message)
// })

client.connection.hub.on('bluetoothDeviceHub', 'onReceiveMessage', (address, message) => {
    console.log(`[${address}]: ${message}`)
})

// set timeout for sending message 
client.callTimeout = 50000 // 10's, default 5000
// Start the connection.
client.start();



async function InputLoop() {
    while (true) {
        const answer = await question("請輸入指令\r\n");
        const splited = answer.split(" ");
        if (splited[0] === "1") {
            try {
                const result = await client.connection.hub.call("bluetoothDeviceHub", "Discover");
                console.log(result);
            }
            catch (err) {
                console.error(err);
            }
        }
        else if (splited[0] === "2") {
            try {
                const result = await client.connection.hub.call("bluetoothDeviceHub", "getDevices");
                console.log(result);
            }
            catch (err) {
                console.error(err);
            }
        }
        else if (splited[0] === "3") {
            try {
                const result = await client.connection.hub.call("bluetoothDeviceHub", "pair", splited[1], splited[2]);
                console.log(result)
            }
            catch (err) {
                console.error(err);
            }
        }
        else if (splited[0] === "4") {
            try {
                const result = await client.connection.hub.call("bluetoothDeviceHub", "unpair", splited[1]);
                console.log(result);
            }
            catch (err) {
                console.error(err);
            }
        }
        else if (splited[0] === "5") {
            try {
                const result = await client.connection.hub.call("bluetoothDeviceHub", "connectSTMSerialPort", splited[1]);
                console.log(result);
            }
            catch (err) {
                console.error(err);
            }
        }
        else if (splited[0] === "6") {
            try {
                client.connection.hub.invoke("bluetoothDeviceHub", "disconnectSTMSerialPort", splited[1]);
            }
            catch (err) {
                console.error(err);
            }
        }else if (splited[0] === "7") {
            try {
                client.connection.hub.invoke("bluetoothDeviceHub", "writeToSerialPort", splited[1]);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
};

InputLoop();