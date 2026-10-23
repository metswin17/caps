
'use strict';

const { startServer } = require('./hub');

const PORT = process.env.PORT || 3000;

startServer(PORT);

console.log(`CAPS: Socket.io server running on port ${PORT}`);
