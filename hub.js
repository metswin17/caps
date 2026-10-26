
'use strict';

const { Server } = require('socket.io');
const { logEvent } = require('./logger');
const MessageQueue = require('./queue');

const PORT = process.env.PORT || 3000;

/**
 * Register CAPS event handlers for a connected client.
 * @param {object} socket - Connected Socket.io client.
 * @param {object} caps - CAPS Socket.io namespace.
 * @param {MessageQueue} queue - Shared queue for pending messages.
 * 
 */
function registerHandlers(socket, caps, queue) {
  console.log(`CAPS: Client connected ${socket.id}`);

  socket.on('join', (store) => {
    socket.join(store);
    console.log(`CAPS: ${socket.id} joined room ${store}`);
  });

  socket.on('pickup', (payload) => {
    logEvent('pickup', payload);
  
    const message = queue.add(
      'drivers',
      'pickup',
      payload.orderId,
      payload
    );
  
    caps.to('drivers').emit('pickup', message);
  });

  socket.on('in-transit', (payload) => {
    logEvent('in-transit', payload);
    caps.to(payload.store).emit('in-transit', payload);
  });

  socket.on('delivered', (payload) => {
    logEvent('delivered', payload);
  
    const message = queue.add(
      payload.store,
      'delivered',
      payload.orderId,
      payload
    );
  
    caps.to(payload.store).emit('delivered', message);
  });

  socket.on('disconnect', () => {
    console.log(`CAPS: Client disconnected ${socket.id}`);
  });

  socket.on('getAll', ({ clientId, event }) => {
    const messages = queue.getAll(clientId, event);
  
    messages.forEach((message) => {
      socket.emit(event, message);
    });
  });
  
  socket.on('received', ({ clientId, event, messageId }) => {
    const removed = queue.remove(clientId, event, messageId);
  
    if (removed) {
      console.log(`CAPS: Acknowledged ${event} message ${messageId}`);
    }
  });

}

/**
 * Start the CAPS Socket.io server.
 * @param {number|string} port - Server port.
 * @returns {object} Socket.io server and CAPS namespace.
 */
function startServer(port = PORT) {
  const io = new Server(port);
  const caps = io.of('/caps');
  const queue = new MessageQueue();

  caps.on('connection', (socket) => {
    registerHandlers(socket, caps, queue);
  });

  return { io, caps };
}

module.exports = {
  registerHandlers,
  startServer,
};

