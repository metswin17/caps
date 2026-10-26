
'use strict';

const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000/caps';

/**
 * Handle a package pickup and delivery.
 * @param {object} payload - Package order information.
 * @param {object} socket - Socket.io client connection.
 */
function handlePickup(payload, socket) {
  // Confirm the package was picked up.
  console.log(`DRIVER: picked up ${payload.orderId}`);

  // Notify CAPS that the package is in transit.
  socket.emit('in-transit', payload);

  // Confirm the package was delivered.
  console.log(`DRIVER: delivered ${payload.orderId}`);

  // Notify CAPS that delivery is complete.
  socket.emit('delivered', payload);
}

/**
 * Connect the driver to the CAPS Socket.io server.
 * @returns {object} Socket.io client connection.
 */
function startDriver() {
  const socket = io(SERVER_URL);

  socket.on('connect', () => {
    console.log(`DRIVER: connected to CAPS ${socket.id}`);

    socket.emit('join', 'drivers');
  
    socket.emit('getAll', {
      clientId: 'drivers',
      event: 'pickup',
    });
  });

  socket.on('pickup', (message) => {
    const order = message.order || message;
  
    handlePickup(order, socket);
  
    if (message.messageId) {
      socket.emit('received', {
        clientId: 'drivers',
        event: 'pickup',
        messageId: message.messageId,
      });
    }
  });

  socket.on('connect_error', (error) => {
    console.error(`DRIVER: connection error: ${error.message}`);
  });

  return socket;
}

// Start the driver only when this file is run directly.
if (require.main === module) {
  startDriver();
}

module.exports = { handlePickup, startDriver };
