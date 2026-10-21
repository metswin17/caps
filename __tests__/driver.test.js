
'use strict';

const caps = require('../hub');
const { handlePickup } = require('../driver');

describe('CAPS Driver', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('logs the pickup and delivery messages', () => {
    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation();

    const emitSpy = jest
      .spyOn(caps, 'emit')
      .mockImplementation();

    handlePickup(payload);

    expect(consoleSpy).toHaveBeenCalledWith(
      'DRIVER: picked up 12345'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'DRIVER: delivered 12345'
    );

    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  test('emits in-transit and delivered events', () => {
    const payload = {
      store: '1-206-flowers',
      orderId: '67890',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    const emitSpy = jest
      .spyOn(caps, 'emit')
      .mockImplementation();

    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation();

    handlePickup(payload);

    expect(emitSpy).toHaveBeenNthCalledWith(
      1,
      'in-transit',
      payload
    );

    expect(emitSpy).toHaveBeenNthCalledWith(
      2,
      'delivered',
      payload
    );
  });
});
