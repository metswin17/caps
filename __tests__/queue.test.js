'use strict';

const MessageQueue = require('../queue');

describe('MessageQueue', () => {

  test('getAll returns a stored pickup message', () => {
    // ARRANGE: Create a queue and add an order.
    const queue = new MessageQueue();

    queue.add('drivers', 'pickup', 'order-101', {
      store: 'acme-widgets',
    });

    // ACT: Retrieve the driver's pickup messages.
    const messages = queue.getAll('drivers', 'pickup');

    // ASSERT: Verify the correct message was returned.
    expect(messages).toHaveLength(1);
    expect(messages[0].messageId).toBe('order-101');
    expect(messages[0].clientId).toBe('drivers');
  });

  test('remove deletes only the selected message', () => {
    // ARRANGE: Create a queue with two orders.
    const queue = new MessageQueue();
  
    queue.add('drivers', 'pickup', 'order-101', {
      store: 'acme-widgets',
    });
  
    queue.add('drivers', 'pickup', 'order-102', {
      store: '1-800-flowers',
    });
  
    // ACT: Remove only order-101.
    const removed = queue.remove('drivers', 'pickup', 'order-101');
  
    // ASSERT: Verify the correct order was removed.
    const remaining = queue.getAll('drivers', 'pickup');
  
    expect(removed).toBe(true);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].messageId).toBe('order-102');
  });

  test('getAll returns an empty array when no messages exist', () => {
    // ARRANGE: Create a new empty queue.
    const queue = new MessageQueue();
  
    // ACT: Request messages from the empty queue.
    const messages = queue.getAll('drivers', 'pickup');
  
    // ASSERT: Verify that an empty array is returned.
    expect(messages).toEqual([]);
  });

  test('keeps delivery messages separate for each store', () => {
    // ARRANGE: Create a queue with two stores.
    const queue = new MessageQueue();
  
    queue.add('acme-widgets', 'delivered', 'order-201', {
      store: 'acme-widgets',
    });
  
    queue.add('1-800-flowers', 'delivered', 'order-202', {
      store: '1-800-flowers',
    });
  
    // ACT: Retrieve messages for each store.
    const acmeMessages = queue.getAll('acme-widgets', 'delivered');
    const flowerMessages = queue.getAll('1-800-flowers', 'delivered');
  
    // ASSERT: Each store receives only its own message.
    expect(acmeMessages).toHaveLength(1);
    expect(acmeMessages[0].messageId).toBe('order-201');
  
    expect(flowerMessages).toHaveLength(1);
    expect(flowerMessages[0].messageId).toBe('order-202');
  });

});