
'use strict';

const { randomUUID } = require('node:crypto');
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000/caps';
const STORE_NAME = '1-206-flowers';

/**
 * Create a package order for a vendor.
 * @param {string} store - Vendor's store name.
 * @returns {object} Package order information.
 */
function createOrder(store) {
  return {
    store,
    orderId: randomUUID(),
    customer: 'Jane Doe',
    address: 'Portland, OR',
  };
}

/**
 * Notify CAPS that a package is ready for pickup.
 * @param {string} store - Vendor's store name.
 * @param {object} socket - Socket.io client connection.
 * @returns {object} Created order.
 */
function requestPickup(store, socket) {
  const order = createOrder(store);
  socket.emit('pickup', order);
  return order;
}

/**
 * Thank the customer after delivery.
 * @param {object} payload - Delivered package information.
 */
function handleDelivered(payload) {
  console.log(`Thank you for your order ${payload.customer}`);
}

/**
 * Connect the vendor to the CAPS server.
 * @returns {object} Socket.io client connection.
 */
function startVendor() {
  const socket = io(SERVER_URL);

  socket.on('connect', () => {
  console.log(`VENDOR: connected to CAPS ${socket.id}`);

  // Join the room associated with this store.
  socket.emit('join', STORE_NAME);

  // Request deliveries missed while disconnected.
  socket.emit('getAll', {
    clientId: STORE_NAME,
    event: 'delivered',
  });
});

socket.on('delivered', (message) => {
  const order = message.order || message;

  handleDelivered(order);

  if (message.messageId) {
    socket.emit('received', {
      clientId: STORE_NAME,
      event: 'delivered',
      messageId: message.messageId,
    });
  }
});

  socket.on('connect_error', (error) => {
    console.error(`VENDOR: connection error: ${error.message}`);
  });

  // Create a new order every 5 seconds while connected.
  const orderInterval = setInterval(() => {
    if (socket.connected) {
      requestPickup(STORE_NAME, socket);
    }
  }, 5000);

  // Stop generating orders when the client closes.
  socket.on('disconnect', () => {
    console.log('VENDOR: disconnected from CAPS');
  });

  return { socket, orderInterval };
}

// Start the vendor only when this file is executed directly.
if (require.main === module) {
  startVendor();
}

module.exports = {
  createOrder,
  requestPickup,
  handleDelivered,
  startVendor,
};
