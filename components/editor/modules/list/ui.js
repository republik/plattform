import React from 'react'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'
import { newBlock } from './'

export const createListButton = ({TYPE, ordered, label}) => createBlockButton({
  type: TYPE,
  reducer: props =>
    event => {
      const { onChange, state } = props
      event.preventDefault()

      const inList = state.document.getClosest(state.startBlock.key, matchBlock(TYPE))

      if (inList) {
        return onChange(
          state
            .change()
            .setNodeByKey(inList.key, {
              data: inList.data.merge({
                ordered
              })
            })
        )
      }

      return onChange(
        state
          .change()
          .call(
            injectBlock,
            newBlock({ordered})
          )
      )
    }
})(
  ({ active, disabled, visible, ...props }) =>
    <span
      {...buttonStyles.block}
      {...props}
      data-active={active}
      data-disabled={disabled}
      data-visible={visible}
      >
      {label}
    </span>
)
