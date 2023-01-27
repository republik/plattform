import { css, merge } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'

import { chfFormat, countFormat } from '../../lib/utils/formats'
import { Fragment } from 'react'

const PADDING = 15

const td = css({
  textAlign: 'left',
  verticalAlign: 'top',
  paddingTop: 3,
  paddingBottom: 3,
})

const tdNum = merge(td, {
  textAlign: 'right',
  fontFeatureSettings: '"tnum" 1, "kern" 1',
})

const th = css({
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

export const tableStyles = {
  table: css({
    ...fontStyles.sansSerifRegular,
    borderSpacing: 0,
    paddingLeft: PADDING,
    paddingRight: PADDING,
    width: '100%',
    maxWidth: 640,
    '@media (max-width: 600px)': {
      fontSize: 14,
    },
    '& th': {
      ...fontStyles.sansSerifMedium,
    },
    '& td, & th': {
      paddingRight: 10,
    },
    '& td:last-child, & th:last-child': {
      paddingRight: 0,
    },
  }),
  alternateRowBg: css({
    '& tr:nth-child(odd) td': {
      backgroundColor: '#eee',
    },
  }),
  td,
  tdNum,
  th: merge(td, th),
  thNum: merge(tdNum, th),
}

export const TableRaw = ({ children }) => {
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
        {...tableStyles.table}
        {...colorScheme.set('borderBottomColor', 'text')}
      >
        {children}
      </table>
    </div>
  )
}

export default ({ groups, columnLabels = ['Anzahl', 'Total'] }) => (
  <TableRaw>
    {/* <thead>
      <tr>
        <th {...tableStyles.td}></th>
        <th {...tableStyles.tdNum}>Anzahl</th>
        <th {...tableStyles.tdNum}>Total in CHF</th>
      </tr>
    </thead> */}
    <tbody>
      {groups.map(({ key, values }) => {
        return (
          <Fragment key={key}>
            <tr>
              <th {...tableStyles.th}>{key}</th>
              <th {...tableStyles.thNum}>{columnLabels[0]}</th>
              <th {...tableStyles.thNum}>{columnLabels[1]}</th>
            </tr>
            {values.map(({ key, value }) => (
              <tr key={key}>
                <td {...tableStyles.td}>{key}</td>
                <td {...tableStyles.tdNum}>{countFormat(value.count)}</td>
                <td {...tableStyles.tdNum}>{chfFormat(value.total / 100)}</td>
              </tr>
            ))}
          </Fragment>
        )
      })}
    </tbody>
  </TableRaw>
)
