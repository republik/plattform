import React from 'react'
import { Block } from 'slate'
import { css } from 'glamor'
import { createBlockButton } from '../../utils'
import { UL, LI } from './constants'
import { PARAGRAPH } from '../paragraph'
import styles from '../../styles'

export const ULButton = createBlockButton({
  type: UL,
  reducer: props =>
    event => {
      const { onChange, state } = props
      event.preventDefault()
      return onChange(
        state
          .transform()
          .insertBlock(
            Block.create({
              type: UL,
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
          .setBlock(UL)
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
      UL
    </span>
)
