import { Block } from 'slate'
import { matchBlock, matchDocument } from '../../utils'
import { IMAGE } from '../image'
import { PARAGRAPH } from '../paragraph'
import { LEAD } from '../lead'
import { TITLE } from '../title'
import { COVER } from './constants'
import {
  rule,
  not,
  either,
  isNone,
  firstChild,
  childAt,
  childrenAfter,
  prepend,
  insertAt,
  update,
  unwrap
} from '../../utils/rules'

const Cover = ({ children }) => {
  const [ image, title, lead ] = children
  return <div>
    {image}
    <div>
      <div>
        <div>
          {title}
          {lead}
        </div>
      </div>
    </div>
  </div>
}

export const isCover = matchBlock(COVER)

export const cover = {
  match: isCover,
  render: Cover
}

export {
  COVER
}

const isImage = matchBlock(IMAGE)
const isTitle = matchBlock(TITLE)
const isLead = matchBlock(LEAD)

const onCover = rule(isCover)

export default {
  plugins: [
    {
      schema: {
        rules: [
          // Element
          cover,

          // Document restrictions
          rule(
            matchDocument,
            firstChild(not(isCover)),
            prepend(() => Block.create({
              type: COVER,
              nodes: [
                Block.create({ type: IMAGE, isVoid: true }),
                Block.create({ type: TITLE }),
                Block.create({ type: LEAD })
              ]
            }))
          ),
          // Restrictions
          onCover(
            firstChild(not(isImage)),
            prepend(() => Block.create({ type: IMAGE, isVoid: true }))
          ),
          onCover(
            either(
              childAt(1, isNone),
              childAt(1, isLead)
            ),
            insertAt(1, () => Block.create({ type: TITLE }))
          ),
          onCover(
            childAt(1, not(isTitle)),
            update(() => TITLE)
          ),
          onCover(
            childAt(2, isNone),
            insertAt(2, () => Block.create({ type: LEAD }))
          ),
          onCover(
            childAt(2, not(isLead)),
            update(() => LEAD)
          ),
          onCover(
            childrenAfter(2),
            unwrap(() => PARAGRAPH)
          )
        ]
      }
    }
  ]
}
