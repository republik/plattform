import mockEditor from './mockEditor'
import { createEditor } from 'slate'
import { moveElement, removeElement } from '../editor/helpers/structure'
import { cleanupTree } from '../editor/helpers/tree'
import { blockQuote, figure, headline, paragraph } from './blocks'
import articleSchema from '../../schema/article'

describe('Slate Editor', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema: articleSchema }

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

  describe('removeElement()', () => {
    it('should remove element when structure allows it', async () => {
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

      removeElement(editor, [2])
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([headline, blockQuote, figure])
    })

    it('should not remove element if it leaves a void in the structure', async () => {
      value = [headline, paragraph, figure]
      const structure = [
        { type: 'headline' },
        {
          type: ['paragraph', 'blockQuote'],
          repeat: true,
        },
        { type: 'figure' },
      ]
      const editor = await setup(structure)

      removeElement(editor, [1])
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([headline, paragraph, figure])
    })

    it('should not remove element in dry mode', async () => {
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

      const canRemove = removeElement(editor, [2], true)
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        headline,
        blockQuote,
        paragraph,
        figure,
      ])
      expect(canRemove).toBe(true)
    })
  })
})
