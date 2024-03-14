import { css } from '@app/styled-system/css'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import rehypeReact, { Options as RehypeReactOptions } from 'rehype-react'
import remarkRehype, { Options as RemarkRehypeOptions } from 'remark-rehype'
import { unified } from 'unified'

const remarkRehypeOptions: RemarkRehypeOptions = {
  handlers: {
    // @ts-expect-error zone is not a default mdast node
    zone(state, node) {
      return {
        type: 'element',
        tagName: node.identifier,
        properties: { ...node.data },
        children: state.all(node),
      }
    },
  },
}

const rehypeReactOptions: RehypeReactOptions = {
  Fragment,
  jsx,
  jsxs,
  components: {
    // @ts-expect-error zones are converted to custom components
    FIGURE: (props) => {
      return <figure {...props} />
    },
    CENTER: (props) => {
      return (
        <div className={css({ maxWidth: 900, margin: 'auto' })} {...props} />
      )
    },
    TITLE: (props) => {
      return <div className={css({ fontSize: '4xl' })} {...props} />
    },
  },
}

const processor = unified()
  .use(remarkRehype, remarkRehypeOptions)
  .use(rehypeReact, rehypeReactOptions)

export const MdastRender = async ({ mdast }: { mdast: any }) => {
  const nodes = await processor.run(mdast)
  return (
    <>
      {nodes}
      <pre>{JSON.stringify(mdast, null, 2)}</pre>
    </>
  )
}
