import type { SlateNode } from './NodeMapping'
import visit from './visit'

type CollapseOptions = {
  prefix?: number
  postfix?: number
  char?: string
}

/**
 * Collapses link text.
 *
 */
async function collapseLinkText(
  children: SlateNode[],
  options?: CollapseOptions,
): Promise<void> {
  const { prefix = 35, postfix = 10, char = '…' } = options || {}

  await visit(
    children,
    (child) => {
      return (
        child?.type === 'link' &&
        !!child?.href &&
        child?.children?.length === 1 &&
        child.children[0]?.text === child.href &&
        child.href.length > Math.round((prefix + postfix) * 1.2)
      )
    },
    (child) => {
      child.children[0].text = [
        child.children[0].text.slice(0, prefix),
        child.children[0].text.slice(0 - postfix),
      ].join(char)

      console.log(child.children[0]?.text, child.href)
    },
  )
}

module.exports = collapseLinkText
