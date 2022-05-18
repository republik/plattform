import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { selectNearestWord } from '../editor/helpers/text'

describe('Slate Editor', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  async function setup(structure) {
    const mock = getMockEditor()
    const [editor] = await buildTestHarness(Editor)({
      editor: mock,
      initialValue: value,
      componentProps: {
        structure,
        value,
        setValue: (val) => (value = val),
      },
    })
    return editor
  }

  describe('selectNearestWord()', () => {
    value = [
      {
        type: 'paragraph',
        children: [{ text: 'Lorem ipsum dolor sit amet.' }],
      },
    ]
    const structure = [
      {
        type: 'paragraph',
      },
    ]
    let changedSelection

    it('should change selection to word inside which the cursor is', async () => {
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(true)
    })

    it('should not select words if cursor is outside', async () => {
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 6 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      })
      expect(changedSelection).toBe(false)

      await Transforms.select(editor, { path: [0, 0], offset: 11 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(false)
    })

    it('should support dry run mode', async () => {
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      changedSelection = selectNearestWord(editor, true)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 9 },
        focus: { path: [0, 0], offset: 9 },
      })
      expect(changedSelection).toBe(true)
    })
  })
})
