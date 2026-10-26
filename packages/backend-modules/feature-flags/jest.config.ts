/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Sources are compiled into build/; without this jest collects the compiled
  // .js copies and chokes on the .d.ts files ("must contain at least one test").
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
}
