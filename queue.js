
'use strict';

/**
 * Stores pending CAPS messages by client ID and event name.
 * Messages remain until the intended client acknowledges them.
 */
class MessageQueue {
  constructor() {
    this.messages = new Map();
  }

  /**
   * Add a message to a client's event queue.
   *
   * @param {string} clientId - Recipient's queue identifier.
   * @param {string} event - Event name, such as pickup or delivered.
   * @param {string} messageId - Unique identifier for the message.
   * @param {object} order - Original order payload.
   * @returns {object} The queued message.
   */
  add(clientId, event, messageId, order) {
    const key = `${clientId}:${event}`;

    if (!this.messages.has(key)) {
      this.messages.set(key, new Map());
    }

    const message = {
      event,
      messageId,
      clientId,
      order,
    };

    this.messages.get(key).set(messageId, message);

    return message;
  }

  /**
   * Retrieve all pending messages for a client and event.
   *
   * @param {string} clientId - Recipient's queue identifier.
   * @param {string} event - Event name to retrieve.
   * @returns {object[]} Array of pending messages.
   */
  getAll(clientId, event) {
    const key = `${clientId}:${event}`;
    const queue = this.messages.get(key);

    if (!queue) {
      return [];
    }

    return Array.from(queue.values());
  }

  /**
   * Remove an acknowledged message from a client's queue.
   *
   * @param {string} clientId - Recipient's queue identifier.
   * @param {string} event - Event name.
   * @param {string} messageId - Message to remove.
   * @returns {boolean} True if the message was removed.
   */
  remove(clientId, event, messageId) {
    const key = `${clientId}:${event}`;
    const queue = this.messages.get(key);

    if (!queue) {
      return false;
    }

    return queue.delete(messageId);
  }

}

module.exports = MessageQueue;


