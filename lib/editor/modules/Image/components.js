import { Block, Text } from 'slate'

const clickHandler = (get, state, onChange) => () => {
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

const AddImageButton = get => ({ state, onChange }) => {
  const Button = get('Image.UI.AddImageButton')
  return (
    <Button onClick={clickHandler(get, state, onChange)} />
  )
}

export default get => ({
  AddImageButton: AddImageButton(get)
})
