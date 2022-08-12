import Promise from 'bluebird'
import type { SlateNode } from './NodeMapping'

type Predicate = (child: SlateNode) => boolean | Promise<boolean>
type Visitor = (child: SlateNode) => void | Promise<void>

/**
 * A simple and unsafe walker. Visits and mutates array of Slate
 * nodes ("Slate tree").
 *
 * It is unsafe since mutating children might throw walker into an
 * infinitiy loop. A risk taken to keep code simple.
 *
 */
export default function visit(
  node: SlateNode,
  predicate: Predicate,
  visitor: Visitor,
): Promise<SlateNode> {
  if (!node?.children) {
    return Promise.resolve(node)
  }

  return Promise.each(node.children, async (child) => {
    if (await predicate(child)) {
      await visitor(child)
    }

    if (child?.children) {
      await visit(child, predicate, visitor)
    }
  })
}

module.exports = visit
