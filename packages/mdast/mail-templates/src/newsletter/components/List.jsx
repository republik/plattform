export const ListItem = ({ children }) => <li>{children}</li>

const List = ({ children, data }) =>
  data.ordered ? <ol start={data.start}>{children}</ol> : <ul>{children}</ul>

export default List
