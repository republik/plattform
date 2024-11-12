import { fontStyles } from '../../styleguide-clone/theme/fonts'

const List = ({ children, ordered, start }) => {
  if (ordered) return <ol start={start}>{children}</ol>
  return <ul>{children}</ul>
}

export default List

export const ListItem = ({ children }) => <li>{children}</li>

export const ListParagraph = ({ children }) => (
  <p
    style={{
      ...fontStyles.serifRegular,
      fontSize: '19px',
      lineHeight: '30px',
      margin: '0px 0px',
    }}
  >
    {children}
  </p>
)
