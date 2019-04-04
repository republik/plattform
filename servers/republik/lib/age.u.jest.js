const UUT = require('./age')

const pinnedDate = new Date('2017-05-01')

const expectedAges = [
  { date: new Date('2019-10-01'), age: -3 },
  { date: new Date('2019-01-01'), age: -2 },
  { date: new Date('2018-06-20'), age: -2 },
  { date: new Date('2018-02-15'), age: -1 },
  { date: new Date('2018-01-15'), age: -1 },
  { date: new Date('2017-10-01'), age: -1 },
  { date: new Date('2017-05-01'), age: 0 },
  { date: new Date('2017-01-01'), age: 0 },
  { date: new Date('2000-10-01'), age: 16 },
  { date: new Date('2000-05-02'), age: 16 },
  { date: new Date('2000-05-01'), age: 17 },
  { date: new Date('2000-04-30'), age: 17 }
]

describe('age', () => {
  describe('age()', () => {
    beforeAll(() => {
      global.Date = class extends Date {
        constructor () {
          return pinnedDate
        }
      }
    })

    expectedAges.map(({ date, age }) => {
      test(`date ${date.toISOString()} returns "${age}" years`, () => {
        expect(UUT.age(date)).toEqual(age)
      })
    })

    describe('invalid arguments resulting in errors', () => {
      test('A string', () => {
        expect(() => UUT.age('string')).toThrowError(TypeError)
      })

      test('A number', () => {
        expect(() => UUT.age(12345)).toThrowError(TypeError)
      })

      test('An object', () => {
        expect(() => UUT.age({})).toThrowError(TypeError)
      })
    })
  })
})
