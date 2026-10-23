
'use strict';

const { registerHandlers } = require('../hub');

describe('CAPS Socket.io Hub', () => {
  let socket;
  let caps;

  beforeEach(() => {
    socket = {
      id: 'test-socket-123',
      on: jest.fn(),
      join: jest.fn(),
      broadcast: {
        emit: jest.fn(),
      },
    };

    caps = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('registers all required Socket.io events', () => {
    registerHandlers(socket, caps);

    expect(socket.on).toHaveBeenCalledWith(
      'join',
      expect.any(Function)
    );

    expect(socket.on).toHaveBeenCalledWith(
      'pickup',
      expect.any(Function)
    );

    expect(socket.on).toHaveBeenCalledWith(
      'in-transit',
      expect.any(Function)
    );

    expect(socket.on).toHaveBeenCalledWith(
      'delivered',
      expect.any(Function)
    );

    expect(socket.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
  });

  
  test('joins the vendor to the correct store room', () => {
    registerHandlers(socket, caps);

    const joinHandler = socket.on.mock.calls.find(
      ([event]) => event === 'join'
    )[1];

    joinHandler('1-206-flowers');

    expect(socket.join).toHaveBeenCalledWith(
      '1-206-flowers'
    );
  });

  
  test('broadcasts pickup events to other clients', () => {
    registerHandlers(socket, caps);

    const pickupHandler = socket.on.mock.calls.find(
      ([event]) => event === 'pickup'
    )[1];

    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    pickupHandler(payload);

    expect(socket.broadcast.emit).toHaveBeenCalledWith(
      'pickup',
      payload
    );
  });

  
  test('routes in-transit events to the correct vendor room', () => {
    registerHandlers(socket, caps);

    const transitHandler = socket.on.mock.calls.find(
      ([event]) => event === 'in-transit'
    )[1];

    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    transitHandler(payload);

    expect(caps.to).toHaveBeenCalledWith(
      '1-206-flowers'
    );

    expect(caps.to().emit).toHaveBeenCalledWith(
      'in-transit',
      payload
    );
  });

  
  test('routes delivered events to the correct vendor room', () => {
    registerHandlers(socket, caps);

    const deliveredHandler = socket.on.mock.calls.find(
      ([event]) => event === 'delivered'
    )[1];

    const payload = {
      store: '1-206-flowers',
      orderId: '12345',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };

    deliveredHandler(payload);

    expect(caps.to).toHaveBeenCalledWith(
      '1-206-flowers'
    );

    expect(caps.to().emit).toHaveBeenCalledWith(
      'delivered',
      payload
    );
  });

  test('logs when a client disconnects', () => {
    registerHandlers(socket, caps);
  
    // Find the disconnect callback registered by the hub.
    const disconnectHandler = socket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )[1];
  
    // Simulate a client disconnecting.
    disconnectHandler();
  
    expect(console.log).toHaveBeenCalledWith(
      'CAPS: Client disconnected test-socket-123'
    );
  });

});



