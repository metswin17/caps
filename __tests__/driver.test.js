
'use strict';

// Mock Socket.io so tests do not open a real connection.
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

const { io } = require('socket.io-client');
const { handlePickup, startDriver } = require('../driver');
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

    const socket = {
      emit: jest.fn(),
    };

    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    handlePickup(payload, socket);

    expect(consoleSpy).toHaveBeenCalledWith(
      'DRIVER: picked up 12345'
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'DRIVER: delivered 12345'
    );

    expect(socket.emit).toHaveBeenCalledTimes(2);
  });

  test('emits in-transit and delivered events', () => {
    const payload = {
      store: '1-206-flowers',
      orderId: '67890',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    const socket = {
      emit: jest.fn(),
    };

    jest.spyOn(console, 'log')
      .mockImplementation(() => {});

    handlePickup(payload, socket);

    expect(socket.emit).toHaveBeenNthCalledWith(
      1,
      'in-transit',
      payload
    );

    expect(socket.emit).toHaveBeenNthCalledWith(
      2,
      'delivered',
      payload
    );
  });

  test('connects to CAPS and registers driver events', () => {
    // Create a fake Socket.io connection.
    const socket = {
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    // Make our mocked io() return the fake socket.
    io.mockReturnValue(socket);
  
    // Start the driver.
    const result = startDriver();
  
    // Verify the correct Socket.io namespace.
    expect(io).toHaveBeenCalledWith(
      'http://localhost:3000/caps'
    );
  
    // Verify the event listeners were registered.
    expect(socket.on).toHaveBeenCalledWith(
      'connect',
      expect.any(Function)
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'pickup',
      expect.any(Function)
    );
  
    expect(socket.on).toHaveBeenCalledWith(
      'connect_error',
      expect.any(Function)
    );
  
    // Verify startDriver returns the connection.
    expect(result).toBe(socket);
  });

  test('logs when the driver connects to CAPS', () => {
    const socket = {
      id: 'driver-123',
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});
  
    startDriver();
  
    // Find the callback registered for the connect event.
    const connectHandler = socket.on.mock.calls.find(
      ([event]) => event === 'connect'
    )[1];
  
    // Simulate the Socket.io connection event.
    connectHandler();
  
    expect(consoleSpy).toHaveBeenCalledWith(
      'DRIVER: connected to CAPS driver-123'
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
  
    startDriver();
  
    // Retrieve the registered connection-error callback.
    const errorHandler = socket.on.mock.calls.find(
      ([event]) => event === 'connect_error'
    )[1];
  
    // Simulate a failed connection.
    errorHandler(new Error('Connection refused'));
  
    expect(errorSpy).toHaveBeenCalledWith(
      'DRIVER: connection error: Connection refused'
    );
  });

  test('handles a pickup received from CAPS', () => {
    const socket = {
      on: jest.fn(),
      emit: jest.fn(),
    };
  
    io.mockReturnValue(socket);
  
    jest.spyOn(console, 'log')
      .mockImplementation(() => {});
  
    startDriver();
  
    // Find the pickup listener registered by startDriver.
    const pickupHandler = socket.on.mock.calls.find(
      ([event]) => event === 'pickup'
    )[1];
  
    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };
  
    // Simulate CAPS sending a pickup event.
    pickupHandler(payload);
  
    expect(socket.emit).toHaveBeenNthCalledWith(
      1,
      'in-transit',
      payload
    );
  
    expect(socket.emit).toHaveBeenNthCalledWith(
      2,
      'delivered',
      payload
    );
  });

});
