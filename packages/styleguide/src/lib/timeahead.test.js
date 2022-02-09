import timeahead from './timeahead'
import { createFormatter } from './translate'

describe('timeahead test-suite', () => {
  const t = createFormatter(require('./translations.json').data)
  ;[
    [
      'now', // test name
      new Date(2018, 0, 11), // "now"
      new Date(2018, 0, 11), // date to compare now with
      'in weniger als einer Minute', // expected return string
    ],
    [
      'second ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 1),
      'in weniger als einer Minute',
    ],
    [
      'seconds ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 0, 50),
      'in weniger als einer Minute',
    ],
    [
      'minute ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 1, 0),
      'in einer Minute',
    ],
    [
      'minutes ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 11, 0, 10, 0),
      'in 10 Minuten',
    ],
    [
      'hour ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 11, 1, 0, 0),
      'in einer Stunde',
    ],
    [
      'days ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 13, 0, 0, 0),
      'in 2 Tagen',
    ],
    [
      'week ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 0, 18, 0, 0, 0),
      'erst in einer Woche',
    ],
    [
      'month ahead',
      new Date(2018, 0, 11, 0, 0, 0),
      new Date(2018, 1, 11, 0, 0, 0),
      'in einem Monat',
    ],
    [
      '7 months ahead',
      new Date(2017, 4, 31),
      new Date(2018, 0, 12),
      'in 7 Monaten',
    ],
    [
      '1 year ahead',
      new Date(2017, 4, 31),
      new Date(2018, 5, 1),
      'in einem Jahr',
    ],
    [
      '11 years ahead',
      new Date(2017, 4, 31),
      new Date(2028, 5, 1),
      'in 11 Jahren',
    ],
  ].map(([title, now, date, expected]) => {
    test(`timeahead.${title}`, () => {
      expect(timeahead(t, (now - date) / 1000)).toEqual(expected)
    })
  })
})
