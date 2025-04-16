// wrapper.cjs - CommonJS wrapper to load ESM code
const { URL } = require('url');
const path = require('path');

// Path to our ESM module
const modulePath = path.join(__dirname, 'dist/main/index.js');
// Convert to file URL format required for ESM imports
const moduleUrl = new URL(`file://${modulePath}`).href;

// Dynamically import the ESM module
(async () => {
  try {
    await import(moduleUrl);
  } catch (error) {
    console.error('Error loading ESM module:', error);
    process.exit(1);
  }
})(); 