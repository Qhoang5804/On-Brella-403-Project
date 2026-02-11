const assert = require("assert");
const { backendInitialized } = require("../src/server.js");

assert.strictEqual(backendInitialized(), "backend initialized", "should return placeholder string");

console.log("backend.test.js passed");
