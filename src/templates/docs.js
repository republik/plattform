import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'

export const Markdown = ({ children, schema }) => {
  return renderMdast(parse(children), schema)
}
