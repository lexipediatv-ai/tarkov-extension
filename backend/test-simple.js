const express = require('express');
const app = express();

app.get('/', (req, res) => {
    console.log('Request received!');
    res.send('Server is working!');
});

console.log('About to start server...');

const server = app.listen(3001, '0.0.0.0', () => {
    console.log('✅ Test server started on port 3001');
    console.log('Try: http://localhost:3001');
});

server.on('listening', () => {
    console.log('✅ Server is now listening!');
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

console.log('Command executed, waiting for server to start...');
