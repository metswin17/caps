
'use strict';

const caps = require('../hub');
const {
  createOrder,
  requestPickup,
  handleDelivered,
} = require('../vendor');

describe('CAPS Vendor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates an order with the required information', () => {
    const order = createOrder('1-206-flowers');

    expect(order).toEqual({
      store: '1-206-flowers',
      orderId: expect.any(String),
      customer: 'Jane Doe',
      address: 'Portland, OR',
    });
  });

  test('emits a pickup event with the order payload', () => {
    const emitSpy = jest.spyOn(caps, 'emit').mockImplementation();

    const order = requestPickup('1-206-flowers');

    expect(emitSpy).toHaveBeenCalledWith('pickup', order);
  });

  test('thanks the customer after delivery', () => {
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation();

    handleDelivered({
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Thank you for your order Jane Doe'
    );
  });
});
