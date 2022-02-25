import timeduration from './timeduration'
import { createFormatter } from './translate'

describe('timeduration test-suite', () => {
  const t = createFormatter(require('./translations.json').data)

  ;[
    [
      'now', // test name
      new Date(2018, 0, 11), // "now"
      new Date(2018, 0, 11), // date to compare now with
      'vor 0 s', // expected return string
    ],
    [
      'minutes',
      new Date(2018, 0, 11, 0, 10, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 10 m',
    ],
    [
      'hour',
      new Date(2018, 0, 11, 1, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 1 h',
    ],
    [
      'days',
      new Date(2018, 0, 13, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 2 d',
    ],
    [
      'week',
      new Date(2018, 0, 18, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 1 w',
    ],
    [
      'months',
      new Date(2018, 2, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 8 w',
    ],
    ['7 months ago', new Date(2018, 0, 12), new Date(2017, 4, 31), 'vor 32 w'],
    ['a year ago', new Date(2018, 0, 11), new Date(2017, 0, 1), 'vor 1 y'],
    ['3 years ago', new Date(2018, 0, 11), new Date(2015, 0, 11), 'vor 3 y'],
    ['11 years ago', new Date(2018, 0, 11), new Date(2007, 0, 11), 'vor 11 y'],
  ].map(([title, now, date, expected]) => {
    test(`timeduration.${title}`, () => {
      expect(timeduration(t, (now - date) / 1000)).toBe(expected)
    })
  })
})
