import { css, merge } from 'glamor'
import React, { ReactNode, useEffect, useState } from 'react'

import { useColorContext } from '../Colors/ColorContext'
import { fontStyles } from '../Typography'

export const ScrollySubhead = ({
  highlighted,
  mini,
  children,
  slug,
}: {
  highlighted?: boolean
  mini?: boolean
  children: ReactNode
  slug?: string
}) => {
  const [colorScheme] = useColorContext()
  const [currentStep, setCurrentStep] = useState()

  const handleNewStep = (event) => {
    setCurrentStep(event.detail.stepId)
  }

  // A context to keep track of hover events would also be an option.
  useEffect(() => {
    if (!slug) return
    window.addEventListener('newStep', handleNewStep)
    return () => {
      window.removeEventListener('newStep', handleNewStep)
    }
  }, [])

  const styling = merge(
    styles.chapterIndicator,
    mini && styles.chapterIndicatorMini,
    mini && highlighted && styles.miniHighlighted,
  )

  const currentlyHighlighted =
    highlighted || (!!currentStep && currentStep === slug)

  return (
    <span
      {...styling}
      {...(currentlyHighlighted
        ? colorScheme.set('backgroundColor', 'divider')
        : colorScheme.set('backgroundColor', 'default'))}
      {...(currentlyHighlighted
        ? colorScheme.set('color', 'text')
        : colorScheme.set('color', 'textSoft'))}
      {...(currentlyHighlighted
        ? colorScheme.set('borderColor', 'divider')
        : colorScheme.set('borderColor', 'divider'))}
      {...(currentlyHighlighted
        ? colorScheme.set('fontWeight', 'bold')
        : colorScheme.set('fontWeight', 'normal'))}
    >
      {children}
    </span>
  )
}

const styles = {
  chapterIndicatorMini: css({
    ...fontStyles.sansSerifRegular14,
    width: '1.4rem',
    height: '1.4rem',
    margin: 0,
  }),
  miniHighlighted: css({
    ...fontStyles.sansSerifMedium14,
    margin: '0.3rem 0',
  }),
  chapterIndicator: css({
    ...fontStyles.sansSerifMedium22,
    transition: 'all 0.3s cubic-bezier(0.17, 0.55, 0.55, 1)',
    // fontSize: '1rem',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    verticalAlign: 'middle',
    width: '2.2rem',
    height: '2.2rem',
    borderRadius: '50%',
    marginTop: '-0.35rem',
    marginRight: '0.3em',
  }),
}
