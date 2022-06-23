/**
 --- Disabled due to slate-test-utils causing severe issues with building
 --- and apps depending on styleguide
 --- re-enable if a valid alternative for slate-test-utils has been found
 -- or the issues have been fixed

import { tree1 } from '../../examples.imports'
import renderAsText from '../render/text'

describe('Slate Rendering', () => {
  describe('convertToString()', () => {
    it('should work', async () => {
      const text = renderAsText(tree1)
      expect(text).toEqual(
        'La vie de château Once upon a time, in a small castle, lived a bold lady. She was responsible for: the stables the dragons the chicken Basically lots of shit As the peasants say (True that.) Read her story here. The story machine says goodbye.',
      )
    })
  })
})
 */
