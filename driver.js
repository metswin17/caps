
'use strict';

const caps = require('./hub');

/**
 * Handle a package pickup and delivery.
 * @param {object} payload - Package order information.
 */
function handlePickup(payload) {
  // Confirm the package was picked up.
  console.log(`DRIVER: picked up ${payload.orderId}`);

  // Notify CAPS that the package is in transit.
  caps.emit('in-transit', payload);

  // Confirm the package was delivered.
  console.log(`DRIVER: delivered ${payload.orderId}`);

  // Notify CAPS that delivery is complete.
  caps.emit('delivered', payload);
}

// Listen for pickup requests from the Event Hub.
caps.on('pickup', handlePickup);

module.exports = { handlePickup };
