
# CAPS — Code Academy Parcel Service

## Lab: Class 11 — Event Driven Applications

CAPS is a simulated package delivery system built with Node.js and the EventEmitter module.

This project demonstrates event-driven programming by allowing vendors, drivers, and a global event logger to communicate through a shared event hub.

## UML Diagram

[View CAPS UML Diagram](./assets/uml.md)

## Application Structure

- `hub.js` — Creates and exports the shared EventEmitter.
- `logger.js` — Logs package events with timestamps and payloads.
- `vendor.js` — Creates orders, emits pickup requests, and handles delivery confirmations.
- `driver.js` — Responds to pickups and emits delivery updates.
- `index.js` — Starts the application.
- `__tests__/` — Contains Jest unit tests.

## Events

### pickup

The Vendor emits a `pickup` event when an order is ready.

### in-transit

The Driver emits an `in-transit` event after picking up the order.

### delivered

The Driver emits a `delivered` event after completing the delivery.

The Vendor listens for `delivered` and thanks the customer.

## Order Payload

Each order contains:

- `store`
- `orderId`
- `customer`
- `address`

Order IDs are generated using Node.js `randomUUID()`.

## Installation

```bash
npm install
```

## Run the Application

```bash
node index.js
```

The application simulates a delivery for the store `1-206-flowers`.

## Run Tests

```bash
npm test
```

Jest tests verify the Logger, Vendor, and Driver functions using spies, mocks, and assertions.

Current results:

- 3 passing test suites
- 6 passing tests

## Technologies

- JavaScript
- Node.js
- EventEmitter
- Jest

## AI Assistance

ChatGPT was used as a coding tutor during this lab.

Assistance included:

- Planning the EventEmitter architecture.
- Explaining event listeners and event emission.
- Implementing and reviewing the Vendor, Driver, and Logger modules.
- Writing Jest tests using spies and mocks.
- Explaining terminal commands and debugging errors.
- Preparing project documentation.

### AI Prompt Examples

The following are representative requests from the development process, not verbatim transcripts:

1. Help implement a Node.js EventEmitter hub for a CAPS delivery application.
2. Explain how Vendor and Driver modules communicate through events.
3. Help write Jest unit tests for event handlers using spies and mocks.
4. Explain the difference between checking JavaScript syntax and running a Node.js application.

All code was entered, executed, and tested locally during development.

