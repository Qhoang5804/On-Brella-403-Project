/**
 * Backend entry point.
 */

/* replaced backend

function backendInitialized() {
  return "backend initialized";
}

module.exports = { backendInitialized };
*/

const express = require('express');

const app = express();

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'On-Brella backend running' });
});

// Health check endpoint (useful for Render and debugging)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

