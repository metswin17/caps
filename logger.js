

'use strict';

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

module.exports = { logEvent };
