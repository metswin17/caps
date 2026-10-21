
'use strict';

// Load the global event logger first.
require('./logger');

// Load the driver and register its pickup listener.
require('./driver');

// Load the vendor and register its delivery listener.
const vendor = require('./vendor');

// Start our first CAPS delivery simulation.
vendor.requestPickup('1-206-flowers');
