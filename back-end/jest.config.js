module.exports = {
  preset: "jest-puppeteer",
  testMatch: ["**/?(*.)+(spec|test).[t]s"],
  testPathIgnorePatterns: ["/node_modules/", "dist"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  globalSetup: "./jest.global-setup.js",
  globalTeardown: "./jest.global-teardown.js",
  testEnvironment: "./puppeteer_environment.js",
};
