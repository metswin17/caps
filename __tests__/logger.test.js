
'use strict';

const { logEvent } = require('../logger');

describe('CAPS Event Logger', () => {
  let consoleSpy;

  beforeEach(() => {
    // Watch console.log without printing to the terminal.
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore the original console.log.
    consoleSpy.mockRestore();
  });

  test('logs the event name, timestamp, and payload', () => {
    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    logEvent('pickup', payload);

    expect(consoleSpy).toHaveBeenCalledWith(
      'EVENT:',
      expect.objectContaining({
        event: 'pickup',
        time: expect.any(String),
        payload,
      })
    );
  });
});
