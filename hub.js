
'use strict';

const { Server } = require('socket.io');
const { logEvent } = require('./logger');

const PORT = process.env.PORT || 3000;

/**
 * Register CAPS event handlers for a connected client.
 * @param {object} socket - Connected Socket.io client.
 * @param {object} caps - CAPS Socket.io namespace.
 */
function registerHandlers(socket, caps) {
  console.log(`CAPS: Client connected ${socket.id}`);

  socket.on('join', (store) => {
    socket.join(store);
    console.log(`CAPS: ${socket.id} joined room ${store}`);
  });

  socket.on('pickup', (payload) => {
    logEvent('pickup', payload);
    socket.broadcast.emit('pickup', payload);
  });

  socket.on('in-transit', (payload) => {
    logEvent('in-transit', payload);
    caps.to(payload.store).emit('in-transit', payload);
  });

  socket.on('delivered', (payload) => {
    logEvent('delivered', payload);
    caps.to(payload.store).emit('delivered', payload);
  });

  socket.on('disconnect', () => {
    console.log(`CAPS: Client disconnected ${socket.id}`);
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

  caps.on('connection', (socket) => {
    registerHandlers(socket, caps);
  });

  return { io, caps };
}

module.exports = {
  registerHandlers,
  startServer,
};

