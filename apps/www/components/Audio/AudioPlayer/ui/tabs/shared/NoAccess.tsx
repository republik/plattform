import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'
import TrialForm from '../../../../../Trial/Form'

const styles = {
  text: css({
    ...fontStyles.sansSerifRegular16,
    lineHeight: '22px',
  }),
  heading: css({
    ...fontStyles.sansSerifMedizm18,
  }),
}

const NoAccessQueue = ({
  text,
  heading,
}: {
  text: string
  heading: string
}) => {
  return (
    <>
      <p {...styles.text}>{text}</p>
      <h3 {...styles.heading}>{heading}</h3>
      <TrialForm
        minimal
        showTitleBlock={false}
        isInSeriesNav={true}
        payload={{
          variation: 'trynoteAudioPlayer/210613',
          position: 'AudioPlayer',
        }}
      />
    </>
  )
}

export default NoAccessQueue
