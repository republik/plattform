import { ReactNode } from 'react'

import { css, merge } from 'glamor'

import { useColorContext } from '@project-r/styleguide'
import { TRANSITION } from './config'

export const ChapterIndicator = ({
  highlighted,
  mini,
  children,
}: {
  highlighted?: boolean
  mini?: boolean
  children: ReactNode
}) => {
  const [colorScheme] = useColorContext()
  const styling = merge(
    styles.chapterIndicator,
    mini && styles.chapterIndicatorMini,
  )
  return (
    <span
      {...styling}
      {...(highlighted
        ? colorScheme.set('background-color', 'defaultInverted')
        : colorScheme.set('background-color', 'hover'))}
      {...(highlighted
        ? colorScheme.set('color', 'default')
        : colorScheme.set('color', 'text'))}
    >
      {children}
    </span>
  )
}

const styles = {
  chapterIndicatorMini: css({
    width: '1.3rem',
    height: '1.3rem',
    lineHeight: '1.3em',
    fontSize: '0.875rem',
    marginRight: '0.25rem',
  }),
  chapterIndicator: css({
    transition: TRANSITION,
    fontSize: '1rem',
    display: 'inline-flex',
    justifyContent: 'center',
    verticalAlign: 'middle',
    width: '1.675em',
    height: '1.675em',
    lineHeight: '1.675em',
    borderRadius: '0.2rem',
    marginRight: '1rem',
    marginTop: '-0.3rem',
  }),
}
