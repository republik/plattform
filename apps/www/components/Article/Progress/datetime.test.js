import datetime from './datetime'
import { t } from '../../../lib/withT'

describe('/components/Article/Progress/datetime.js', () => {
  ;[
    [
      'today',
      new Date(2019, 1, 15, 7, 14, 0),
      new Date(2019, 1, 15, 0, 0, 0),
      'Ihre Leseposition heute um 07:14 Uhr',
    ],
    [
      'yesterday',
      new Date(2019, 1, 14, 7, 14, 0),
      new Date(2019, 1, 15, 0, 0, 0),
      'Ihre Leseposition gestern um 07:14 Uhr',
    ],
    [
      'two days ago',
      new Date(2019, 1, 13, 7, 14, 0),
      new Date(2019, 1, 15, 0, 0, 0),
      'Ihre Leseposition am 13.02.2019 um 07:14 Uhr',
    ],
    [
      'one year ago',
      new Date(2018, 1, 15, 7, 14, 0),
      new Date(2019, 1, 15, 0, 0, 0),
      'Ihre Leseposition am 15.02.2018 um 07:14 Uhr',
    ],
  ].forEach(([title, date, lastMidnight, expected]) => {
    it('should return correct datetime string | ' + title, () => {
      expect(datetime(t, date, undefined, lastMidnight)).toEqual(expected)
    })
  })
})
