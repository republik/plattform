import { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Sources are compiled into build/; without this jest collects both the .ts
  // originals and their compiled .js copies (and chokes on the .d.ts files).
  testPathIgnorePatterns: ['/node_modules/', '/build/'],
}

export default config
