// tests/example.test.ts
import { test, expect } from 'vitest'
import { TestContainerSetup } from './setup-containers.js'

test('example test', () => {
  expect(true).toBeTruthy()
})

describe('End-to-End Tests', () => {
  let testContainerSetup: TestContainerSetup | null

  beforeEach(async () => {
    testContainerSetup = new TestContainerSetup()
    await testContainerSetup.start()
  })

  afterEach(async () => {
    await testContainerSetup?.stop()
  })

  // Your tests go here
  test(
    'example test',
    async () => {
      // const response = await fetch(
      //   `http://${containers.webContainer.getHost()}:${containers.webContainer.getMappedPort(
      //     80,
      //   )}/`,
      // )
      // const text = await response.text()
      // expect(text).toContain('Hello, World!')
      expect(true).toBeTruthy()
    },
    {
      timeout: 100_000,
    },
  )
})
