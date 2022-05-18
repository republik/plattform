import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor } from 'slate'

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

  it('should apply formatting style to selected text', async () => {})

  it('should apply formatting from cursor position and on if selection is collapsed', async () => {})

  it('should remove active mark from cursor position and on if selection is collapsed', async () => {})

  it('should remove active mark from corresponding selected position', async () => {})

  it('should apply mark to whole selection, even if selection already include part with active mark', async () => {})

  it('should support multiple marks at once', async () => {})
})
