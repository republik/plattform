import Promise from 'bluebird'
import type { SlateNode } from './NodeMapping'

type Predicate = (child: SlateNode) => Promise<boolean>
type Visitor = (child: SlateNode) => Promise<SlateNode>

/**
 * A simple and unsafe walker. Visits and mutates array of Slate
 * nodes ("Slate tree").
 *
 * It is unsafe since mutating children might throw walker into an
 * infinitiy loop. A risk taken to keep code simple.
 *
 */
function visit(
  children: SlateNode[],
  predicate: Predicate,
  visitor: Visitor,
): Promise<SlateNode[]> {
  // Promise.each returns children.
  // A visitor may mutate children.
  return Promise.each(children, async (child) => {
    if (await predicate(child)) {
      await visitor(child)
    }

    if (child?.children) {
      await visit(child.children, predicate, visitor)
    }
  })
}

module.exports = visit
