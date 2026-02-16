module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.jest.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: ["frontend/src/**/*.js", "backend/src/**/*.js"],
};
