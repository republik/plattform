import React from 'react'
import { css } from 'glamor'
import withMe from '../../lib/withMe'
import SignOut from '../Auth/SignOut'

const styles = {
  container: css({
    maxWidth: 200,
    paddingTop: 30,
    marginRight: 25,
    whiteSpace: 'normal'
  })
}

export const Me = ({ me }) => (
  <div {...styles.container}>
    {me && (me.name || me.email)}
    <br />
    <SignOut />
  </div>
)

export default withMe(Me)
