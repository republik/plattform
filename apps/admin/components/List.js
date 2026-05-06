import { css } from '@republik/theme/css'

import { fontFamilies } from '@project-r/styleguide'

const styles = {
  list: css({
    fontFamily: fontFamilies.sansSerifRegular,
    fontSize: 17,
    lineHeight: '25px',
    listStyle: 'none',
    margin: '10px 0',
    padding: 0,
  }),
  item: css({
    borderTop: `1px solid token(colors.divider)`,
    padding: '5px 0',
    ':last-child': {
      borderBottom: `1px solid token(colors.divider)`,
    },
  }),
  highlight: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontWeight: 'normla',
  }),
}

export const Item = ({ children }) => (
  <li className={styles.item}>{children}</li>
)

const List = ({ children, ...props }) => (
  <ul {...props} className={styles.list}>
    {children}
  </ul>
)

export const Highlight = ({ children }) => (
  <span className={styles.highlight}>{children}</span>
)

export default List
