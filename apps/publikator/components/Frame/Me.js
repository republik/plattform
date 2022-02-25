import React from 'react'
import { css } from 'glamor'
import withMe from '../../lib/withMe'
import SignOut from '../Auth/SignOut'
import { mediaQueries } from '@project-r/styleguide'

const styles = {
  container: css({
    maxWidth: 200,
    paddingTop: 30,
    marginRight: 25,
    whiteSpace: 'normal',
    [mediaQueries.onlyS]: {
      marginRight: 15,
      fontSize: 12,
    },
  }),
}

export const Me = ({ me }) => (
  <div {...styles.container}>
    {me && (me.name || me.email)}
    <br />
    <SignOut />
  </div>
)

export default withMe(Me)
