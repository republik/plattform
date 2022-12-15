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
    ...fontStyles.sansSerifRegular,
    borderSpacing: '10px 0',
    paddingLeft: 5,
    paddingRight: 5,
    width: '100%',
    maxWidth: 640,
    '@media (max-width: 600px)': {
      fontSize: 14,
    },
    '& th': {
      ...fontStyles.sansSerifMedium,
    },
  }),
  td,
  num,
  groupTd: merge(td, groupTd),
  groupTdNum: merge(num, groupTd),
  highlight: css({
    ...fontStyles.sansSerifMedium,
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

export default ({ groups, columnLabels = ['Anzahl', 'Total'] }) => (
  <Table>
    {/* <thead>
      <tr>
        <th {...styles.td}></th>
        <th {...styles.num}>Anzahl</th>
        <th {...styles.num}>Total in CHF</th>
      </tr>
    </thead> */}
    <tbody>
      {groups.map(({ key, values }) => {
        return (
          <Fragment key={key}>
            <tr>
              <td {...styles.groupTd} style={{ lineHeight: '1.3em' }}>
                <span {...styles.highlight}>{key}</span>
              </td>
              <th {...styles.groupTdNum}>{columnLabels[0]}</th>
              <th {...styles.groupTdNum}>{columnLabels[1]}</th>
            </tr>
            {values.map(({ key, value }) => (
              <tr key={key}>
                <td {...styles.td}>{key}</td>
                <td {...styles.num}>{countFormat(value.count)}</td>
                <td {...styles.num}>{chfFormat(value.total / 100)}</td>
              </tr>
            ))}
          </Fragment>
        )
      })}
    </tbody>
  </Table>
)
