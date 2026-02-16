module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.jest.test.js"],
  testPathIgnorePatterns: ["/node_modules/", "/hardwareSimulation/"],
  collectCoverageFrom: ["frontend/src/**/*.js", "backend/src/**/*.js"],
};
