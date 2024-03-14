import { unified } from 'unified'
import remarkRehype from 'remark-rehype'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { visit } from 'unist-util-visit'

const r = unified()
  // .use(() => (tree) => {
  //   visit(tree, 'zone', (node) => {
  //     console.log(node.type)
  //   })
  // })
  .use(remarkRehype, {
    // unknownHandler: (state, node, parent) => {
    //   console.log(node.type)
    //   if (node.type === 'zone') {
    //     return { ...node, type: 'div' }
    //   }
    // },
    // passThrough: ['zone'],
    handlers: {
      zone(state, node, parent) {
        console.log(node.type)
        return {
          type: 'element',
          tagName: 'section',
          properties: {},
          children: state.all(node),
        }
      },
    },
  })
  .use(
    () => (tree) =>
      toJsxRuntime(tree, {
        Fragment,
        jsx,
        jsxs,
        // components: {
        //   div: (props) => {
        //     console.log(props)
        //     return <div {...props} />
        //   },
        // },
      }),
  )

export const MdastRender = async ({ mdast }: { mdast: any }) => {
  const nodes = await r.run(mdast)
  return (
    <>
      {nodes}
      <pre>{JSON.stringify(mdast, null, 2)}</pre>
    </>
  )
}
