import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import TrialForm from '../../../../../Trial/Form'

const styles = {
  text: css({
    ...fontStyles.sansSerifRegular16,
    lineHeight: '22px',
  }),
  heading: css({
    ...fontStyles.sansSerifMedium18,
  }),
}

const NoAccessQueue = ({
  text,
  heading,
}: {
  text: string
  heading: string
}) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', 'text')}>
      <p {...styles.text}>{text}</p>
      <h3 {...styles.heading}>{heading}</h3>
      <TrialForm
        minimal
        // series nav styling
        isInSeriesNav={true}
        payload={{
          variation: 'trynoteAudioPlayer/210613',
          position: 'AudioPlayer',
        }}
        // prevent navigation after success
        onSuccess={() => {
          return false
        }}
      />
    </div>
  )
}

export default NoAccessQueue
