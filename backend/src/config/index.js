/**
 * Backend configuration. Uses env vars with sensible defaults.
 * Extensible: add more config as needed.
 */

const config = {
  port: parseInt(process.env.PORT || "5001", 10),
  hardwareUrl: process.env.HARDWARE_URL || "http://localhost:3000",
};

module.exports = config;
