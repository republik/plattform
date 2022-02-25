import React from 'react'
import { css, merge } from 'glamor'
import { formatLocale } from 'd3-format'

import { groupped, total, totalChf, colors } from './data'

import { fontFamilies, useColorContext } from '@project-r/styleguide'

const nbspNumbers = formatLocale({
  decimal: ',',
  thousands: '\u00a0',
  grouping: [3],
  currency: ['CHF\u00a0', ''],
})
const countFormat = nbspNumbers.format(',.0f')
const percentFormat = nbspNumbers.format(' 05.1%')

const PADDING = 15

const td = css({
  textAlign: 'left',
  verticalAlign: 'top',
  paddingTop: 3,
  paddingBottom: 3,
})

const num = merge(td, {
  textAlign: 'right',
  fontFeatureSettings: '"tnum" 1, "kern" 1',
})

const groupTd = css({
  paddingTop: 10,
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  verticalAlign: 'bottom',
  'tr:first-child > &': {
    paddingTop: 3,
  },
  'tr:last-child > &': {
    borderBottom: 'none',
  },
})

const styles = {
  table: css({
    fontFamily: fontFamilies.sansSerifRegular,
    borderSpacing: '10px 0',
    paddingLeft: 5,
    paddingRight: 5,
    minWidth: '100%',
    '@media (max-width: 600px)': {
      fontSize: 14,
    },
    '& th': {
      fontFamily: fontFamilies.sansSerifMedium,
      fontWeight: 'normal',
    },
  }),
  td,
  num,
  groupTd: merge(td, groupTd),
  groupTdNum: merge(num, groupTd),
  highlight: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontWeight: 'normal',
  }),
}

const Table = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        marginLeft: -PADDING,
        marginRight: -PADDING,
      }}
    >
      <table
        {...styles.table}
        {...colorScheme.set('borderBottomColor', 'text')}
      >
        {children}
      </table>
    </div>
  )
}

export default () => (
  <Table>
    <thead>
      <tr>
        <th {...styles.td}>Aktionärin</th>
        <th {...styles.num}>Anzahl</th>
        <th {...styles.num}>Stimmen</th>
        <th {...styles.num}>Kapital</th>
      </tr>
    </thead>
    <tbody>
      {groupped.children.map((group, i) => {
        const elements = [
          <tr key={i}>
            <td {...styles.groupTd} style={{ lineHeight: '1.3em' }}>
              <span
                {...styles.highlight}
                style={{ color: colors[group.data.Kategorie] }}
              >
                {group.data.Kategorie.replace(/ /g, '\u00a0')}
              </span>
              <br />
              <span style={{ fontSize: 12 }}>
                Typ&nbsp;{group.data.Typ}, CHF&nbsp;{group.data['Nominal CHF']}
              </span>
            </td>
            <th {...styles.groupTdNum}>{countFormat(group.value)}</th>
            <th {...styles.groupTdNum}>{percentFormat(group.value / total)}</th>
            <th {...styles.groupTdNum}>
              {percentFormat(
                (group.value * group.data['Nominal CHF']) / totalChf,
              )}
            </th>
          </tr>,
        ]

        if (group.children) {
          group.children.forEach((entity, i) => {
            elements.push(
              <tr key={`entity${i}`}>
                <td {...styles.td}>{entity.data.Aktionärin}</td>
                <td {...styles.num}>{countFormat(entity.value)}</td>
                <td {...styles.num}>{percentFormat(entity.value / total)}</td>
                <td {...styles.num}>
                  {percentFormat(
                    (entity.value * entity.data['Nominal CHF']) / totalChf,
                  )}
                </td>
              </tr>,
            )
          })
        }

        return elements
      })}
      <tr>
        <th {...styles.groupTd}>Total</th>
        <th {...styles.groupTdNum}>{countFormat(total)}</th>
        <th {...styles.groupTdNum}>100,0%</th>
        <th {...styles.groupTdNum}>100,0%</th>
      </tr>
    </tbody>
  </Table>
)
