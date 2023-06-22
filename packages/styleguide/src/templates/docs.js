import { renderMdast } from '@republik/mdast-react-render'
import { parse } from '@republik/remark-preset'

export const Markdown = ({ children, schema, rootData }) => {
  return renderMdast(
    {
      ...parse(children),
      ...rootData,
    },
    schema,
  )
}
