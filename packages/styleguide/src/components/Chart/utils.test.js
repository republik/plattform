import { calculateAxis } from './utils'

const tLabel = (identity) => identity

describe('chart utils test-suite', () => {
  it('calculateAxis with round ticks', () => {
    const yAxis = calculateAxis('.2f', tLabel, [99.34, 2507.3], 'Meter', {
      ticks: [100, 500, 1000, 2000],
    })

    expect(yAxis.format(99.34)).toEqual('99,34')
    expect(yAxis.axisFormat(100)).toEqual('100')
    expect(yAxis.axisFormat(2000, true)).toEqual('2000 Meter')
  })

  it('calculateAxis with uneven ticks', () => {
    const yAxis = calculateAxis('.1f', tLabel, [70, 85], 'Jahre')

    expect(yAxis.format(80.57)).toEqual('80,6')
    expect(yAxis.ticks).toEqual([70, 77.5, 85])
    expect(yAxis.axisFormat(77.5)).toEqual('77,5')
    expect(yAxis.axisFormat(85, true)).toEqual('85,0 Jahre')
  })

  it('calculateAxis with two decimal digit ticks', () => {
    const yAxis = calculateAxis(
      '.2f',
      tLabel,
      [0.35, 0.65],
      'Gini-Koeffizient',
      {
        ticks: [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65],
      },
    )

    expect(yAxis.format(0.6)).toEqual('0,60')
    expect(yAxis.axisFormat(0.65)).toEqual('0,65')
    expect(yAxis.axisFormat(0.6)).toEqual('0,60')
  })

  it('calculateAxis with percentages', () => {
    const yAxis = calculateAxis('.1%', tLabel, [0, 0.15], '%', {
      ticks: [0, 0.05, 0.1, 0.15],
    })
    expect(yAxis.axisFormat(0.05)).toEqual('5')
    expect(yAxis.format(0.05)).toEqual('5,0\u2009%')
  })

  it('thousand separator', () => {
    const axis = calculateAxis(
      's',
      tLabel,
      [-10000, 10000],
      'Gini-Koeffizient',
      {
        ticks: [],
      },
    )

    expect(axis.format(-1000)).toEqual('\u22121000')
    expect(axis.format(1000)).toEqual('1000')
    expect(axis.format(-10000)).toEqual('\u221210’000')
    expect(axis.format(10000)).toEqual('10’000')
  })
})
