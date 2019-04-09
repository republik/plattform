
const moment = require('moment')

const UUT = require('./cancel')

describe('cancel', () => {
  test('properties signature', () => {
    expect(UUT).toMatchSnapshot()
  })

  describe('evaluatePeriods()', () => {
    const getInterval = (start, end) => moment.duration(moment(end).diff(moment(start)))

    test('Pledge A caused initial, past period: leave untampered', () => {
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days')
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }))
        .toMatchObject([{
          _raw: periods[0],
          isCausedByPledge: true,
          isObsolete: false,
          updateAttributes: {}
        }])
    })

    test('Pledge A caused initial, current period: update period.endDate', () => {
      const now = moment()
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days')
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([{
          _raw: periods[0],
          isCausedByPledge: true,
          isObsolete: false,
          updateAttributes: { endDate: now }
        }])
    })

    test('Pledge A caused initial, future period: flag period obsolete', () => {
      const now = moment()
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days')
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([{
          _raw: periods[0],
          isCausedByPledge: true,
          isObsolete: true,
          updateAttributes: {}
        }])
    })

    test('Pledge A caused initial, past period: leave periods untampered', () => {
      const now = moment()
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days'),
          pledgeId: 'pledge-B'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          }
        ])
    })

    test('Pledge A caused initial, current period: update current and subsequent periods', () => {
      const now = moment()
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().add(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-B'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {
              endDate: now
            }
          },
          {
            _raw: periods[1],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: now,
              endDate: now.clone().add(getInterval(periods[1].beginDate, periods[1].endDate))
            }
          }
        ])
    })

    test('Pledge A caused initial, current period: update current and subsequent two periods', () => {
      const now = moment()
      const pledgeId = 'pledge-A'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().add(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-3',
          membershipId: 'membership-a',
          beginDate: moment().add(20, 'days'),
          endDate: moment().add(40, 'days'),
          pledgeId: 'pledge-C'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {
              endDate: now
            }
          },
          {
            _raw: periods[1],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: now,
              endDate: now.clone().add(getInterval(periods[1].beginDate, periods[1].endDate))
            }
          },
          {
            _raw: periods[2],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: now.clone().add(getInterval(periods[1].beginDate, periods[1].endDate)),
              endDate: now.clone()
                .add(getInterval(periods[1].beginDate, periods[1].endDate))
                .add(getInterval(periods[2].beginDate, periods[2].endDate))
            }
          }
        ])
    })

    test('Pledge B caused subsequent, past period: leave periods untampered', () => {
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(30, 'days'),
          endDate: moment().subtract(20, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days'),
          pledgeId: 'pledge-B'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {}
          }
        ])
    })

    test('Pledge B caused subsequent, current period: update current period', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }
      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days'),
          pledgeId: 'pledge-B'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {
              endDate: now
            }
          }
        ])
    })

    test('Pledge B caused subsequent, future period: flag future period obsolete', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }

      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-B'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: true,
            updateAttributes: {}
          }
        ])
    })

    test('Pledge B caused middle, past period: leave untampered', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }

      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(30, 'days'),
          endDate: moment().subtract(20, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-3',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().subtract(5, 'days'),
          pledgeId: 'pledge-C'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[2],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          }
        ])
    })

    test('Pledge B caused middle, current period: update period.endDate and subsequent period', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }

      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(20, 'days'),
          endDate: moment().subtract(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-3',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-C'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: false,
            updateAttributes: {
              endDate: now
            }
          },
          {
            _raw: periods[2],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: now,
              endDate: now.clone().add(getInterval(periods[2].beginDate, periods[2].endDate))
            }
          }
        ])
    })

    test('Pledge B caused middle, future period: flag period obsolete and update subsequent period', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }

      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-3',
          membershipId: 'membership-a',
          beginDate: moment().add(20, 'days'),
          endDate: moment().add(30, 'days'),
          pledgeId: 'pledge-C'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: true,
            updateAttributes: {}
          },
          {
            _raw: periods[2],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: moment(periods[0].endDate),
              endDate: moment(periods[0].endDate).add(getInterval(periods[2].beginDate, periods[2].endDate))
            }
          }
        ])
    })

    test('Pledge B caused 2 middle, future periods: flag periods obsolete and update subsequent period', () => {
      const now = moment()
      const pledgeId = 'pledge-B'
      const membership = {
        id: 'membership-a',
        pledgeId: 'pledge-A'
      }

      const periods = [
        {
          id: 'period-1',
          membershipId: 'membership-a',
          beginDate: moment().subtract(10, 'days'),
          endDate: moment().add(10, 'days')
        },
        {
          id: 'period-2',
          membershipId: 'membership-a',
          beginDate: moment().add(10, 'days'),
          endDate: moment().add(20, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-3',
          membershipId: 'membership-a',
          beginDate: moment().add(20, 'days'),
          endDate: moment().add(22, 'days'),
          pledgeId: 'pledge-B'
        },
        {
          id: 'period-4',
          membershipId: 'membership-a',
          beginDate: moment().add(22, 'days'),
          endDate: moment().add(32, 'days'),
          pledgeId: 'pledge-C'
        }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }, { now }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[1],
            isCausedByPledge: true,
            isObsolete: true,
            updateAttributes: {}
          },
          {
            _raw: periods[2],
            isCausedByPledge: true,
            isObsolete: true,
            updateAttributes: {}
          },
          {
            _raw: periods[3],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {
              beginDate: moment(periods[0].endDate),
              endDate: moment(periods[0].endDate).add(getInterval(periods[3].beginDate, periods[3].endDate))
            }
          }
        ])
    })

    test('throws Errors if argument is missing', () => {
      expect(() => UUT.evaluatePeriods({
        // pledgeId: 1,
        membership: {},
        periods: []
      })).toThrowErrorMatchingSnapshot()
      expect(() => UUT.evaluatePeriods({
        pledgeId: 1,
        // membership: {},
        periods: []
      })).toThrowErrorMatchingSnapshot()
      expect(() => UUT.evaluatePeriods({
        pledgeId: 1,
        membership: {}
        // periods: []
      })).toThrowErrorMatchingSnapshot()
    })

    test('filters periods of other memberships', () => {
      const pledgeId = 'pledge-0000'
      const membership = { id: 'membership-a', pledgeId: 'pledge-9999' }
      const periods = [
        { id: 1, membershipId: 'membership-a' },
        { id: 2, membershipId: 'membership-b' },
        { id: 3, membershipId: 'membership-a' },
        { id: 4, membershipId: 'membership-c' }
      ]

      expect(UUT.evaluatePeriods({ pledgeId, membership, periods }))
        .toMatchObject([
          {
            _raw: periods[0],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          },
          {
            _raw: periods[2],
            isCausedByPledge: false,
            isObsolete: false,
            updateAttributes: {}
          }
        ])
    })
  })
})
