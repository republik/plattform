import { Block, Text } from 'slate'

const clickHandler = (get, state, onChange) => e => {
  e.preventDefault()
  onChange(
    state
      .transform()
      .insertBlock({
        type: get('Image.Constants.IMAGE_WITH_CAPTION'),
        nodes: [
          Block.create({
            type: get('Image.Constants.IMAGE'),
            isVoid: true
          }),
          Block.create({
            type: get('Image.Constants.IMAGE_CAPTION'),
            nodes: [Text.createFromString('')]
          }),
          Block.create({
            type: get('Image.Constants.IMAGE_SOURCE'),
            nodes: [Text.createFromString('')]
          })
        ]
      })
      .apply()
  )
}

const isDisabled = state => state.isBlurred

const AddImageButton = get => ({ state, onChange }) => {
  const disabled = isDisabled(state)
  const Button = get('Image.UI.AddImageButton')
  const onMouseDown = !disabled
    ? clickHandler(get, state, onChange)
    : e => e.preventDefault()
  return (
    <Button onMouseDown={onMouseDown} data-disabled={disabled} />
  )
}

export default get => ({
  AddImageButton: AddImageButton(get)
})
