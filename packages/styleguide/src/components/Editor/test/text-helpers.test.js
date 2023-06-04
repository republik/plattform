import { createEditor, Transforms } from 'slate'
import { insertSpecialChars, selectNearestWord } from '../Core/helpers/text'
import schema from '../schema/article'
import mockEditor from './mockEditor'
import { act } from '@testing-library/react'

describe('Slate Editor', () => {
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(config) {
    return act(async () =>
      mockEditor(createEditor(), {
        config,
        value,
        setValue: (val) => (value = val),
      }),
    )
  }

  describe('selectNearestWord()', () => {
    const structure = [
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    let changedSelection

    it('should change selection to word inside which the cursor is', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 9 })
        changedSelection = selectNearestWord(editor)
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(true)
    })

    it('should not select words if cursor is outside', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 6 })
        changedSelection = selectNearestWord(editor)
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      })
      expect(changedSelection).toBe(false)
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 11 })
        changedSelection = selectNearestWord(editor)
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(false)
    })

    it('should not select across elements', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 5 })
        changedSelection = selectNearestWord(editor)
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      })
    })

    it('should support dry run mode', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 9 })
        changedSelection = selectNearestWord(editor, true)
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 9 },
        focus: { path: [0, 0], offset: 9 },
      })
      expect(changedSelection).toBe(true)
    })
  })

  describe('insertSpecialChars()', () => {
    const structure = [
      {
        type: 'paragraph',
      },
    ]

    it('should insert single character into text', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 9 })
        await insertSpecialChars(editor, '%')
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 10 },
        focus: { path: [0, 0], offset: 10 },
      })
      expect(value[0].children[0].text).toEqual('Lorem ips%um dolor sit amet.')
    })

    it('should insert two characters (e.g. quotes) into text and place the cursor in the middle', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum:.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, { path: [0, 0], offset: 12 })
        await insertSpecialChars(editor, '<>')
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 13 },
        focus: { path: [0, 0], offset: 13 },
      })
      expect(value[0].children[0].text).toEqual('Lorem ipsum:<>.')
    })

    it('should wrap two characters (e.g. quotes) around selected text', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum.' }],
        },
      ]
      const editor = await setup({ ...defaultConfig, structure })
      await act(async () => {
        await Transforms.select(editor, {
          anchor: { path: [0, 0], offset: 6 },
          focus: { path: [0, 0], offset: 11 },
        })
        await insertSpecialChars(editor, '<>')
      })
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 7 },
        focus: { path: [0, 0], offset: 12 },
      })
      expect(value[0].children[0].text).toEqual('Lorem <ipsum>.')
    })
  })
})
