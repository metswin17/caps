
'use strict';

const caps = require('./hub');

/**
 * Log a CAPS event with its timestamp and payload.
 * @param {string} event - Name of the event.
 * @param {object} payload - Package information.
 */
function logEvent(event, payload) {
  console.log('EVENT:', {
    event,
    time: new Date().toISOString(),
    payload,
  });
}

// Listen for the three package events.
caps.on('pickup', (payload) => {
  logEvent('pickup', payload);
});

caps.on('in-transit', (payload) => {
  logEvent('in-transit', payload);
});

caps.on('delivered', (payload) => {
  logEvent('delivered', payload);
});

module.exports = { logEvent };
