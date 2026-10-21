
'use strict';

const { randomUUID } = require('node:crypto');
const caps = require('./hub');

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
 */
function requestPickup(store) {
  const order = createOrder(store);
  caps.emit('pickup', order);
  return order;
}

/**
 * Thank the customer after delivery.
 * @param {object} payload - Delivered package information.
 */
function handleDelivered(payload) {
  console.log(`Thank you for your order ${payload.customer}`);
}

// Register the vendor's delivery listener.
caps.on('delivered', handleDelivered);

module.exports = {
  createOrder,
  requestPickup,
  handleDelivered,
};
