
'use strict';

const { registerHandlers } = require('../hub');
const MessageQueue = require('../queue');

describe('CAPS Socket.io Hub', () => {
  let socket;
  let caps;
  let queue;

  beforeEach(() => {

    queue = new MessageQueue();
     
    socket = {
      id: 'test-socket-123',
      on: jest.fn(),
      join: jest.fn(),
      emit: jest.fn(),
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
    registerHandlers(socket, caps, queue);

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
    registerHandlers(socket, caps, queue);

    const joinHandler = socket.on.mock.calls.find(
      ([event]) => event === 'join'
    )[1];

    joinHandler('1-206-flowers');

    expect(socket.join).toHaveBeenCalledWith(
      '1-206-flowers'
    );
  });

  
  test('broadcasts pickup events to other clients', () => {
    registerHandlers(socket, caps, queue);

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

    pickupHandler(payload);

expect(caps.to).toHaveBeenCalledWith('drivers');

expect(caps.to('drivers').emit).toHaveBeenCalledWith(
  'pickup',
  {
    event: 'pickup',
    messageId: payload.orderId,
    clientId: 'drivers',
    order: payload,
  }
);
});
  
  test('routes in-transit events to the correct vendor room', () => {
    registerHandlers(socket, caps, queue);

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
    registerHandlers(socket, caps, queue);

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
      {
        event: 'delivered',
        messageId: payload.orderId,
        clientId: payload.store,
        order: payload,
      }
    );
  });

  test('logs when a client disconnects', () => {
    registerHandlers(socket, caps, queue);
  
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

  test('getAll replays queued pickup messages to the client', () => {
    registerHandlers(socket, caps, queue);
  
    const getAllHandler = socket.on.mock.calls.find(
      ([event]) => event === 'getAll'
    )[1];
  
    const order = {
      store: 'acme-widgets',
      orderId: 'order-101',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };
  
    const message = queue.add(
      'drivers',
      'pickup',
      order.orderId,
      order
    );
  
    getAllHandler({
      clientId: 'drivers',
      event: 'pickup',
    });
  
    expect(socket.emit).toHaveBeenCalledWith(
      'pickup',
      message
    );
  });

  test('received removes an acknowledged message from the queue', () => {
    registerHandlers(socket, caps, queue);
  
    const receivedHandler = socket.on.mock.calls.find(
      ([event]) => event === 'received'
    )[1];
  
    const order = {
      store: 'acme-widgets',
      orderId: 'order-101',
      customer: 'Jane Doe',
      address: 'Portland, OR',
    };
  
    queue.add('drivers', 'pickup', order.orderId, order);
  
    receivedHandler({
      clientId: 'drivers',
      event: 'pickup',
      messageId: order.orderId,
    });
  
    expect(queue.getAll('drivers', 'pickup')).toEqual([]);
  });

});



