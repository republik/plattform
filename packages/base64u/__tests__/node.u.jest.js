/**
 * @jest-environment node
 */

const testSeries = require('./testSeries.js')

describe('nodejs', () => {
  test('environment', () => {
    expect(typeof window).toEqual('undefined')
  })

  testSeries()
})
