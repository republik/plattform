import timeago from './timeago'
import { createFormatter } from './translate'

describe('timeago test-suite', () => {
  const t = createFormatter(require('./translations.json').data)

  ;[
    [
      'now', // test name
      new Date(2018, 0, 11), // "now"
      new Date(2018, 0, 11), // date to compare now with
      'gerade eben', // expected return string
    ],
    [
      'minutes',
      new Date(2018, 0, 11, 0, 10, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 10 Minuten',
    ],
    [
      'hour',
      new Date(2018, 0, 11, 1, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor einer Stunde',
    ],
    [
      'days',
      new Date(2018, 0, 13, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 2 Tagen',
    ],
    [
      'week',
      new Date(2018, 0, 18, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor einer Woche',
    ],
    [
      'months',
      new Date(2018, 2, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 0),
      'vor 2 Monaten',
    ],
    [
      '7 months ago',
      new Date(2018, 0, 12),
      new Date(2017, 4, 31),
      'vor 7 Monaten',
    ],
    [
      'a year ago',
      new Date(2018, 0, 11),
      new Date(2017, 0, 1),
      'vor einem Jahr',
    ],
    [
      '3 years ago',
      new Date(2018, 0, 11),
      new Date(2015, 0, 11),
      'vor 3 Jahren',
    ],
    [
      '11 years ago',
      new Date(2018, 0, 11),
      new Date(2007, 0, 11),
      'vor 11 Jahren',
    ],
  ].map(([title, now, date, expected]) => {
    test(`timeago.${title}`, () => {
      expect(timeago(t, (now - date) / 1000)).toBe(expected)
    })
  })
})
