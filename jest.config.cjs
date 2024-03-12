// jest.config.cjs for CommonJS
module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'mjs'], // Specify the file extensions Jest should process
  testMatch: [
    "**/__tests__/**/*.js?(x)", // Matches any files in __tests__ folders with .js or .jsx extensions
    "**/?(*.)+(spec|test).js?(x)", // Matches any files ending with .spec.js, .test.js, .spec.jsx, or .test.jsx
    "**/__tests__/**/*.mjs", // Specifically include .mjs files located in __tests__ folders
    "**/?(*.)+(spec|test).mjs" // Matches any files ending with .spec.mjs or .test.mjs
  ],
  transform: {
    '^.+\\.m?js$': 'babel-jest', // Use babel-jest to transform files ending with .js or .mjs
  },
};
