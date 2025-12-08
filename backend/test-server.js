const express = require('express');const express = require('express');

const app = express();const app = express();

const PORT = 3000;const PORT = 3000;



app.get('/', (req, res) => {app.get('/', (req, res) => {

    res.json({ message: 'Test server working!' });    res.json({ status: 'Test server is working!' });

});});



app.get('/api/test', (req, res) => {const server = app.listen(PORT, '0.0.0.0', () => {

    res.json({ success: true, test: 'API working!' });    console.log(`✅ Test server listening on http://localhost:${PORT}`);

});});



app.listen(PORT, () => {server.on('error', (error) => {

    console.log(`Test server running on http://localhost:${PORT}`);    console.error('❌ Error:', error.message);

});    process.exit(1);

});

setTimeout(() => {
    console.log('⏰ Server still running after 5 seconds...');
}, 5000);
