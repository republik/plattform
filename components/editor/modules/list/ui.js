import React from 'react'
import { matchBlock, createBlockButton, buttonStyles } from '../../utils'
import injectBlock from '../../utils/injectBlock'

export const createListButton = ({TYPE, ordered, label, newBlock}) => createBlockButton({
  type: TYPE,
  reducer: props =>
    event => {
      const { onChange, value } = props
      event.preventDefault()

      const inList = value.document.getClosest(value.startBlock.key, matchBlock(TYPE))

      if (inList) {
        return onChange(
          value
            .change()
            .setNodeByKey(inList.key, {
              data: inList.data.merge({
                ordered
              })
            })
        )
      }

      return onChange(
        value
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
