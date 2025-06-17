/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/*.test.(ts|tsx)'],
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    // "src/**/*.{js,jsx,ts,tsx}", // This tells Jest to look at all .js, .jsx, .ts, .tsx files inside the 'src' folder and its subfolders.
    "!src/**/*.d.ts",           // Exclude TypeScript declaration files
    // You might also want to exclude other files that are not part of your app logic, e.g.:
    // "!src/index.tsx",          // Often your main entry point just mounts the app
    // "!src/reportWebVitals.ts", // Utility for web vitals
    // "!src/setupTests.ts",       // Jest setup file
  ],
   //collectCoverage: true
};
