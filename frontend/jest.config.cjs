module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/*.jest.test.js"],
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.jsx?$": "$1",
  },
};
