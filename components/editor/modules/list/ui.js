import React from 'react'
import { Block } from 'slate'
import { css } from 'glamor'
import { matchBlock, createBlockButton } from '../../utils'
import { LIST, LI } from './constants'
import { PARAGRAPH } from '../paragraph'
import styles from '../../styles'

const makeButton = ({ordered, label}) => createBlockButton({
  type: LIST,
  reducer: props =>
    event => {
      const { onChange, state } = props
      event.preventDefault()

      const inList = state.document.getClosest(state.startBlock.key, matchBlock(LIST))

      if (inList) {
        return onChange(
          state
            .transform()
            .setNodeByKey(inList.key, {
              data: inList.data.merge({
                ordered
              })
            })
            .apply()
        )
      }

      return onChange(
        state
          .transform()
          .insertBlock(
            Block.create({
              type: LIST,
              data: {
                ordered
              },
              nodes: [
                Block.create({
                  type: LI,
                  nodes: [
                    Block.create({
                      type: PARAGRAPH
                    })
                  ]
                })
              ]
            })
          )
          .apply()
      )
    }
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...{...css(styles.blockButton), ...props}}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      {label}
    </span>
)

export const ULButton = makeButton({
  ordered: false,
  label: 'UL'
})

export const OLButton = makeButton({
  ordered: true,
  label: 'OL'
})
