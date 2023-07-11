import { css, merge } from 'glamor'

import { useColorContext } from '../__styleguide/components/Colors/ColorContext'
import { fontStyles } from '../__styleguide/components/Typography'

import { TRANSITION } from '../config'

export const ChapterIndicator = ({
  step,
  currentStep,
  mini,
}: {
  step: number
  currentStep: number
  mini?: boolean
}) => {
  const [colorScheme] = useColorContext()
  const highlighted = currentStep === step
  const styling = merge(
    styles.chapterIndicator,
    mini && styles.chapterIndicatorMini,
    mini && highlighted && styles.miniHighlighted,
  )
  return (
    <span
      {...styling}
      {...(highlighted
        ? colorScheme.set('backgroundColor', 'divider')
        : colorScheme.set('backgroundColor', 'default'))}
      {...(highlighted
        ? colorScheme.set('color', 'text')
        : colorScheme.set('color', 'textSoft'))}
      {...(highlighted
        ? colorScheme.set('borderColor', 'divider')
        : colorScheme.set('borderColor', 'divider'))}
      {...(highlighted
        ? colorScheme.set('fontWeight', 'bold')
        : colorScheme.set('fontWeight', 'normal'))}
    >
      {step}
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
    transition: TRANSITION,
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
