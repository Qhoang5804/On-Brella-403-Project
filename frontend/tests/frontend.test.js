const assert = require("assert");
const { frontendInitialized } = require("../src/index.js");

assert.strictEqual(frontendInitialized(), "frontend initialized", "should return placeholder string");

console.log("frontend.test.js passed");
