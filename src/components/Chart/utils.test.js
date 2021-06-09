import test from 'tape'
import { calculateAxis } from './utils'

const tLabel = identity => identity

test('calculateAxis with round ticks', assert => {
  const yAxis = calculateAxis('.2f', tLabel, [99.34, 2507.3], 'Meter', {
    ticks: [100, 500, 1000, 2000]
  })

  assert.equal(yAxis.format(99.34), '99,34', 'format with two decimal digits')
  assert.equal(
    yAxis.axisFormat(100),
    '100',
    'no unnecessary acis decimal digits'
  )
  assert.equal(
    yAxis.axisFormat(2000, true),
    '2000 Meter',
    'include unit for last tick'
  )
  assert.end()
})

test('calculateAxis with uneven ticks', assert => {
  const yAxis = calculateAxis('.1f', tLabel, [70, 85], 'Jahre')

  assert.equal(yAxis.format(80.57), '80,6', 'format with one decimal digit')
  assert.deepEqual(yAxis.ticks, [70, 77.5, 85], 'auto ticks')
  assert.equal(
    yAxis.axisFormat(77.5),
    '77,5',
    'axis fromat with one decimal digit'
  )
  assert.equal(
    yAxis.axisFormat(85, true),
    '85,0 Jahre',
    'include unit for last tick'
  )
  assert.end()
})

test('calculateAxis with two decimal digit ticks', assert => {
  const yAxis = calculateAxis('.2f', tLabel, [0.35, 0.65], 'Gini-Koeffizient', {
    ticks: [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65]
  })

  assert.equal(yAxis.format(0.6), '0,60', 'format with two decimal digit')
  assert.equal(
    yAxis.axisFormat(0.65),
    '0,65',
    'axis fromat with two decimal digit'
  )
  assert.equal(
    yAxis.axisFormat(0.6),
    '0,60',
    'axis fromat with two decimal digit'
  )
  assert.end()
})

test('calculateAxis with percentages', assert => {
  const yAxis = calculateAxis('.1%', tLabel, [0, 0.15], '%', {
    ticks: [0, 0.05, 0.1, 0.15]
  })
  assert.equal(yAxis.axisFormat(0.05), '5', 'format without ,0 on axis')
  assert.equal(yAxis.format(0.05), '5,0%', 'format with ,0 outside of axis')
  assert.end()
})

test('thousand separator', assert => {
  const axis = calculateAxis('s', tLabel, [-10000, 10000], 'Gini-Koeffizient', {
    ticks: []
  })

  assert.equal(axis.format(-1000), '-1000', 'format without thousand separator')
  assert.equal(axis.format(1000), '1000', 'format without thousand separator')

  assert.equal(axis.format(-10000), '-10’000', 'format with thousand separator')
  assert.equal(axis.format(10000), '10’000', 'format with thousand separator')
  assert.end()
})
