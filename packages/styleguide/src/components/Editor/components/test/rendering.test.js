import { tree1 } from '../../examples.imports'
import renderAsText from '../render/text'

describe('Slate Rendering', () => {
  describe('convertToString()', () => {
    it('should work', async () => {
      const value = tree1
      const text = renderAsText(value)
      expect(text).toEqual(
        'La vie de château Once upon a time, in a small castle, lived a bold lady. She was responsible for: the stables the dragons the chicken Basically lots of shit As the peasants say (True that.) Read her story here.',
      )
    })
  })
})
