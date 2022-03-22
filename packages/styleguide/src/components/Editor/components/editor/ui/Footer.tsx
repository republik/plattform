import React from 'react'
import { useSlate } from 'slate-react'
import { useColorContext } from '../../../../Colors/ColorContext'
import { css } from 'glamor'
import { Label } from '../../../../Typography'
import { getCharCount } from '../helpers/text'

const styles = {
  container: css({
    display: 'flex',
    width: '100%',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 10,
    marginTop: 20,
  }),
}

const CharCount: React.FC<{ charLimit: number }> = ({ charLimit }) => {
  const editor = useSlate()
  const [colorScheme] = useColorContext()
  const countdown = charLimit - getCharCount(editor.children)
  return (
    <Label>
      <span
        {...colorScheme.set('color', countdown < 100 ? 'error' : 'textSoft')}
      >
        {countdown} Zeichen
      </span>
    </Label>
  )
}

const Footer: React.FC<{ charLimit: number }> = ({ charLimit }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...styles.container}
      {...colorScheme.set('borderTopColor', 'divider')}
    >
      <CharCount charLimit={charLimit} />
    </div>
  )
}

export default Footer
