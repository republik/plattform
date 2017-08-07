/* global FileReader */
import isUrl from 'is-url'
import isImage from 'is-image'
import { Block, Text } from 'slate'

const onDropOrPasteFiles = get => (e, data, state, editor) => {
  for (const file of data.files) {
    const reader = new FileReader()
    const [ type ] = file.type.split('/')
    if (type !== 'image') continue

    reader.addEventListener('load', () => {
      state = editor.getState()
      state = insertImage(get)(state, data.target, reader.result)
      editor.onChange(state)
    })

    reader.readAsDataURL(file)
  }
}

const onPasteText = get => (e, data, state) => {
  if (!isUrl(data.text)) return
  if (!isImage(data.text)) return
  return insertImage(get)(state, data.target, data.text)
}

const onPaste = get => (e, data, state, editor) => {
  switch (data.type) {
    case 'files': return onDropOrPasteFiles(get)(e, data, state, editor)
    case 'text': return onPasteText(get)(e, data, state)
  }
}

const onDrop = get => (e, data, state, editor) => {
  switch (data.type) {
    case 'files': return onDropOrPasteFiles(get)(e, data, state, editor)
  }
}

const insertImage = get => (state, target, src) => {
  const transform = state.transform()

  if (target) transform.select(target)

  return transform
    .insertBlock({
      type: get('Image.Constants.IMAGE_WITH_CAPTION'),
      nodes: [
        Block.create({
          type: get('Image.Constants.IMAGE'),
          isVoid: true,
          data: { src }
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
}

export default get => ({
  onDropOrPasteFiles: onDropOrPasteFiles(get),
  onPasteText: onPasteText(get),
  onPaste: onPaste(get),
  onDrop: onDrop(get),
  insertImage: insertImage(get)
})
