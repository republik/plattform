import * as components from '@app/app/rsc-artikel/[...path]/components'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import rehypeReact, { Options as RehypeReactOptions } from 'rehype-react'
import remarkRehype, { Options as RemarkRehypeOptions } from 'remark-rehype'
import { unified } from 'unified'

const identifierToComponentName = (id: string): string => {
  return id.charAt(0).toUpperCase() + id.slice(1).toLowerCase()
}

const remarkRehypeOptions: RemarkRehypeOptions = {
  handlers: {
    // @ts-expect-error zone is not a default mdast node
    zone(state, node) {
      const componentName = identifierToComponentName(node.identifier)

      return {
        type: 'element',
        tagName: componentName in components ? componentName : 'section',
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
  // @ts-expect-error zones are converted to custom components
  components,
}

const processor = unified()
  .use(remarkRehype, remarkRehypeOptions)
  .use(rehypeReact, rehypeReactOptions)

export const MdastRender = async ({ mdast }: { mdast: any }) => {
  const nodes = await processor.process(mdast)

  console.log(nodes)

  return (
    <>
      {nodes}
      <pre>{JSON.stringify(mdast, null, 2)}</pre>
    </>
  )
}
