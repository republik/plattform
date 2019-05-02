/**
 * @jest-environment jsdom
 */

const testSeries = require('./testSeries.js')

describe('browser', () => {
  test('environment', () => {
    expect(window).toBeTruthy()
    expect(window.atob).toBeTruthy()
    expect(window.btoa).toBeTruthy()
  })

  testSeries()
})
