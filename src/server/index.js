// This file serves as the standalone entry point for the server when run directly

// Import the startServer function from the actual server implementation
// Using CommonJS require instead of ESM import
const { startServer } = require('./server');

// If this file is being run directly, start the server
if (require.main === module) {
  startServer();
}

// Export for CommonJS
module.exports = { startServer }; 