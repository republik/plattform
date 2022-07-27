import React from 'react'
import { useSlate } from 'slate-react'
import { useColorContext } from '../../../../Colors/ColorContext'
import { css } from 'glamor'
import { Label } from '../../../../Typography'
import { getCountDown } from '../helpers/text'
import { EditorConfig } from '../../../custom-types'

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

export const Countdown: React.FC<{ maxSigns: number }> = ({ maxSigns }) => {
  const editor = useSlate()
  const [colorScheme] = useColorContext()
  const countdown = getCountDown(editor, maxSigns)
  return (
    <Label>
      <span
        {...colorScheme.set('color', countdown < 20 ? 'error' : 'textSoft')}
      >
        {countdown} Zeichen
      </span>
    </Label>
  )
}

const Footer: React.FC<{ config: EditorConfig }> = ({ config }) => {
  const [colorScheme] = useColorContext()
  if (!config.maxSigns) return null
  return (
    <div
      {...styles.container}
      {...colorScheme.set('borderTopColor', 'divider')}
    >
      <Countdown maxSigns={config.maxSigns} />
    </div>
  )
}

export default Footer
