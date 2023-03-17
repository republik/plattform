import { css } from 'glamor'

import { fontStyles, colors } from '@project-r/styleguide'

import {
  IconArrowDropDown as DownIcon,
  IconArrowDropUp as UpIcon
} from '@republik/icons'

import Link from 'next/link'

const styles = {
  table: css({
    borderSpacing: '0 0',
    width: '100%',
  }),
  th: css(
    {
      textAlign: 'left',
      fontWeight: 'normal',
      padding: 8,
      borderBottom: `1px solid ${colors.divider}`,
      ':first-child': {
        paddingLeft: 0,
      },
      ':last-child': {
        paddingRight: 0,
      },
    },
    fontStyles.label,
  ),
  tr: css({
    ':nth-child(even)': {
      backgroundColor: colors.secondaryBg,
    },
  }),
  td: css({
    padding: 8,
    ':first-child': {
      paddingLeft: 0,
    },
    ':last-child': {
      paddingRight: 0,
    },
  }),
  num: css({
    // textAlign: 'right',
    fontFeatureSettings: '"tnum" 1, "kern" 1',
  }),
  order: css({
    display: 'inline-block',
    position: 'relative',
    paddingRight: 20,
  }),
  orderLink: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  orderLinkIcon: css({
    position: 'absolute',
    top: 0,
    right: 0,
  }),
}

export const Table = ({ children, style }) => (
  <table {...styles.table} style={style}>
    {children}
  </table>
)
export const Tr = ({ children }) => <tr {...styles.tr}>{children}</tr>
export const Th = ({ children, style }) => (
  <th {...styles.th} style={style}>
    {children}
  </th>
)
export const Td = ({ children, style, colSpan }) => (
  <td {...styles.td} style={style} colSpan={colSpan}>
    {children}
  </td>
)
export const TdNum = ({ children }) => (
  <td {...styles.td} {...styles.num}>
    {children}
  </td>
)

export const ThOrder = ({
  activeDirection,
  activeField,
  field,
  href,
  children,
  style,
}) => (
  <Th style={style}>
    <span {...styles.order}>
      <Link href={href} replace>
        <a {...styles.orderLink}>
          {children}
          {activeField === field &&
            (activeDirection === 'DESC' ? (
              <DownIcon size={20} {...styles.orderLinkIcon} />
            ) : (
              <UpIcon size={20} {...styles.orderLinkIcon} />
            ))}
        </a>
      </Link>
    </span>
  </Th>
)
