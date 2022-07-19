import schema from '../../schema/article'
import mockEditor from './mockEditor'
import { createEditor } from 'slate'
import { moveElement } from '../editor/helpers/structure'
import { cleanupTree } from '../editor/helpers/tree'
import { blockQuote, figure, headline, paragraph } from './blocks'

describe('Slate Editor', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(structure, config = defaultConfig) {
    return await mockEditor(createEditor(), {
      structure,
      config,
      value,
      setValue: (val) => (value = val),
    })
  }

  describe('moveElement()', () => {
    it('should move element up when structure allows it', async () => {
      value = [headline, blockQuote, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      moveElement(editor, [2], 'up')
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        paragraph,
        blockQuote,
        figure,
      ])
    })

    it('should move element down when structure allows it', async () => {
      value = [headline, blockQuote, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      moveElement(editor, [1], 'down')
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        paragraph,
        blockQuote,
        figure,
      ])
    })

    it('should not move element up if structure disallows it', async () => {
      value = [headline, blockQuote, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      moveElement(editor, [1], 'up')
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        blockQuote,
        paragraph,
        figure,
      ])
    })

    it('should not move element down if structure disallows it', async () => {
      value = [headline, blockQuote, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      moveElement(editor, [2], 'down')
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        blockQuote,
        paragraph,
        figure,
      ])
    })

    it('should allow for dryRun mode', async () => {
      value = [headline, blockQuote, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      const canMove = moveElement(editor, [2], 'up', true)
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        blockQuote,
        paragraph,
        figure,
      ])
      expect(canMove).toBe(true)
    })
  })
})
