import { css } from 'glamor'

import {
  fontFamilies,
  fontStyles,
  useColorContext,
} from '@project-r/styleguide'

const styles = {
  list: css({
    ...fontStyles.sansSerifRegular16,
    listStyle: 'none',
    margin: '10px 0',
    padding: 0,
  }),
  item: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    padding: '5px 0',
    ':last-child': {
      borderBottomWidth: 1,
      borderBottomStyle: 'solid',
    },
  }),
  highlight: css({
    fontFamily: fontFamilies.sansSerifMedium,
    fontWeight: 'normal',
  }),
}

export const Item = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <li {...styles.item} {...colorScheme.set('borderColor', 'divider')}>
      {children}
    </li>
  )
}

const List = ({ children, ...props }) => (
  <ul {...props} {...styles.list}>
    {children}
  </ul>
)

List.Item = Item

export const Highlight = ({ children }) => (
  <span {...styles.highlight}>{children}</span>
)

export default List
