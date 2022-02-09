import React from 'react'
import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'

const styles = {
  title: css({
    margin: '10px 0',
    ':first-child': {
      marginTop: 0,
    },
    ...fontStyles.sansSerifMedium16,
  }),
}

const SubscribeCalloutTitle = ({ children }) => (
  <h4 {...styles.title}>{children}</h4>
)

export default SubscribeCalloutTitle
