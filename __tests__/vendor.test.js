
'use strict';

// Mock Socket.io so tests do not open real connections.
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

const { io } = require('socket.io-client');

const {
  createOrder,
  requestPickup,
  handleDelivered,
  startVendor,
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
    const socket = {
      emit: jest.fn(),
    };

    const order = requestPickup('1-206-flowers', socket);

    expect(socket.emit).toHaveBeenCalledTimes(1);

    expect(socket.emit).toHaveBeenCalledWith(
      'pickup',
      order
    );
  });

  test('thanks the customer after delivery', () => {
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

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

  test('connects to CAPS and registers vendor events', () => {
    const socket = {
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    jest.spyOn(console, 'log')
      .mockImplementation(() => {});
  
    const { socket: vendorSocket, orderInterval } = startVendor();
  
    // Stop the repeating timer created by startVendor.
    clearInterval(orderInterval);
  
    expect(io).toHaveBeenCalledWith(
      'http://localhost:3000/caps'
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'connect',
      expect.any(Function)
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'delivered',
      handleDelivered
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'connect_error',
      expect.any(Function)
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
  
    expect(vendorSocket).toBe(socket);
    expect(orderInterval).toBeDefined();
  });

  test('joins the correct store room when connected', () => {
    const socket = {
      id: 'vendor-123',
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
  
    const { orderInterval } = startVendor();
  
    // Stop the repeating order timer.
    clearInterval(orderInterval);
  
    // Find the registered connect callback.
    const connectHandler = socket.on.mock.calls.find(
      ([event]) => event === 'connect'
    )[1];
  
    // Simulate a successful Socket.io connection.
    connectHandler();
  
    expect(socket.emit).toHaveBeenCalledWith(
      'join',
      '1-206-flowers'
    );
  
    expect(consoleSpy).toHaveBeenCalledWith(
      'VENDOR: connected to CAPS vendor-123'
    );
  });

  test('logs a Socket.io connection error', () => {
    const socket = {
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  
    const { orderInterval } = startVendor();
  
    // Stop the repeating order timer.
    clearInterval(orderInterval);
  
    // Retrieve the connection-error callback.
    const errorHandler = socket.on.mock.calls.find(
      ([event]) => event === 'connect_error'
    )[1];
  
    // Simulate a failed connection.
    errorHandler(new Error('Connection refused'));
  
    expect(errorSpy).toHaveBeenCalledWith(
      'VENDOR: connection error: Connection refused'
    );
  });

  test('automatically requests pickup when connected', () => {
    jest.useFakeTimers();
  
    const socket = {
      connected: true,
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    try {
      const { orderInterval } = startVendor();
  
      try {
        // Simulate five seconds passing instantly.
        jest.advanceTimersByTime(5000);
  
        expect(socket.emit).toHaveBeenCalledWith(
          'pickup',
          expect.objectContaining({
            store: '1-206-flowers',
            orderId: expect.any(String),
            customer: 'Jane Doe',
            address: 'Portland, OR',
          })
        );
      } finally {
        clearInterval(orderInterval);
      }
    } finally {
      jest.useRealTimers();
    }
  });

  test('does not request pickup when disconnected', () => {
    jest.useFakeTimers();
  
    const socket = {
      connected: false,
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    try {
      const { orderInterval } = startVendor();
  
      try {
        // Simulate 15 seconds (three pickup intervals).
        jest.advanceTimersByTime(15000);
  
        // No pickup events should have been emitted.
        expect(socket.emit).not.toHaveBeenCalled();
      } finally {
        clearInterval(orderInterval);
      }
    } finally {
      jest.useRealTimers();
    }
  });

});
