import { renderMdast } from 'mdast-react-render'
import { parse } from '@orbiting/remark-preset'

export const Markdown = ({ children, schema, rootData }) => {
  return renderMdast(
    {
      ...parse(children),
      ...rootData,
    },
    schema,
  )
}
