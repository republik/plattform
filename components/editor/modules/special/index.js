import { matchBlock } from '../../utils'
import { CUSTOM } from './constants'
import { colors } from '@project-r/styleguide'
import { Block } from 'slate'
import { SpecialButton, SpecialForm } from './ui'

const zone = {
  match: matchBlock(CUSTOM),
  matchMdast: (node) => node.type === 'zone',
  fromMdast: (node, index, parent, visitChildren) => {
    return {
      kind: 'block',
      type: CUSTOM,
      data: {
        identifier: node.identifier,
        ...node.data
      },
      isVoid: true
    }
  },
  toMdast: (object, index, parent, visitChildren, context) => {
    const {identifier, ...data} = object.data
    return {
      type: 'zone',
      identifier,
      data: data,
      children: []
    }
  },
  render: ({ node, state }) => {
    const active = state.blocks.some(block => block.key === node.key)
    return (
      <div style={{
        width: '100%',
        height: '20vh',
        paddingTop: '8vh',
        textAlign: 'center',
        backgroundColor: colors.primaryBg,
        transition: 'outline-color 0.2s',
        outline: '4px solid transparent',
        outlineColor: active ? colors.primary : 'transparent',
        marginBottom: 10
      }}>
        {node.data.get('identifier') || 'Special'}
      </div>
    )
  }
}

export const newBlock = () => Block.fromJSON(
  zone.fromMdast({
    type: 'zone',
    identifier: 'SPECIAL',
    data: {}
  })
)

export {
  CUSTOM,
  SpecialButton,
  SpecialForm
}

export default {
  plugins: [
    {
      schema: {
        rules: [
          zone
        ]
      }
    }
  ]
}
