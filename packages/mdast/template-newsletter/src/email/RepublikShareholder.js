import React from 'react'
import {css} from 'glamor'
import {formatLocale} from 'd3-format'

import {groupped, total, totalChf, colors} from '../web/RepublikShareholder.data'

const nbspNumbers = formatLocale({
  decimal: ',',
  thousands: '\u00a0',
  grouping: [3],
  currency: ['CHF\u00a0', '']
})
const countFormat = nbspNumbers.format(',.0f')
const percentFormat = nbspNumbers.format(' 05.1%')

const PADDING = 3

const styles = {
  num: {
    textAlign: 'right',
    fontFeatureSettings: '"tnum" 1, "kern" 1'
  },
  table: {
    borderSpacing: '20px 0',
    minWidth: '100%',
    fontFamily: 'sans-serif',
    marginBottom: 20,
    fontSize: 12,
    borderSpacing: `${PADDING}px 0`
  },
  trTdTh: {
    textAlign: 'left',
    verticalAlign: 'top',
    paddingTop: 3,
    paddingBottom: 3
  },
  groupTrTdTh: {
    textAlign: 'left',
    paddingTop: '10px',
    paddingBottom: 3,
    borderBottom: '1px solid #000',
    verticalAlign: 'bottom'
  },
  groupTrFistTdTh: {
    paddingTop: 3
  },
  groupTrLastTdTh: {
    borderBottom: 'none'
  }
}

const Table = ({children}) => (
  <div style={{overflowX: 'auto', overflowY: 'hidden', marginLeft: -PADDING, marginRight: -PADDING}}>
    <table style={styles.table}>
      {children}
    </table>
  </div>
)

export default () => (
  <Table>
    <thead>
      <tr>
        <th style={styles.trTdTh}>Aktionärin</th>
        <th style={{...styles.trTdTh, ...styles.num}}>Anzahl</th>
        <th style={{...styles.trTdTh, ...styles.num}}>Stimmen</th>
        <th style={{...styles.trTdTh, ...styles.num}}>Kapital</th>
      </tr>
    </thead>
    <tbody>
      {groupped.children.map((group, i) => {
        const style = i === 0
          ? {...styles.groupTrTdTh, ...styles.groupTrFistTdTh}
          : styles.groupTrTdTh

        const elements = [
          <tr key={i}>
            <td style={{...style, lineHeight: '1.3em'}}>
              <strong style={{color: colors[group.data.Kategorie]}}>
                {group.data.Kategorie.replace(/ /g, '\u00a0')}
              </strong>
              <br />
              <span style={{fontSize: 10}}>
                Typ&nbsp;{group.data.Typ}, CHF&nbsp;{group.data['Nominal CHF']}
              </span>
            </td>
            <th style={{...style, ...styles.num}}>{countFormat(group.value)}</th>
            <th style={{...style, ...styles.num}}>{percentFormat(group.value / total)}</th>
            <th style={{...style, ...styles.num}}>{percentFormat(group.value * group.data['Nominal CHF'] / totalChf)}</th>
          </tr>
        ]

        if (group.children) {
          group.children.forEach((entity, i) => {
            elements.push(
              <tr key={`entity${i}`}>
                <td style={styles.trTdTh}>{entity.data.Aktionärin}</td>
                <td style={{...styles.trTdTh, ...styles.num}}>{countFormat(entity.value)}</td>
                <td style={{...styles.trTdTh, ...styles.num}}>{percentFormat(entity.value / total)}</td>
                <td style={{...styles.trTdTh, ...styles.num}}>{percentFormat(entity.value * entity.data['Nominal CHF'] / totalChf)}</td>
              </tr>
            )
          })
        }

        return elements
      })}
      <tr>
        <th style={{...styles.groupTrTdTh, ...styles.groupTrLastTdTh}}>Total</th>
        <th style={{...styles.groupTrTdTh, ...styles.groupTrLastTdTh, ...styles.num}}>{countFormat(total)}</th>
        <th style={{...styles.groupTrTdTh, ...styles.groupTrLastTdTh, ...styles.num}}>100,0%</th>
        <th style={{...styles.groupTrTdTh, ...styles.groupTrLastTdTh, ...styles.num}}>100,0%</th>
      </tr>
    </tbody>
  </Table>
)
