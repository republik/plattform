import * as React from 'react'
import { StatelessComponent } from 'react'
import { compose } from 'redux'

import withMe from '../../lib/withMe'
import withT from '../../lib/withT'

import SignIn from './SignIn'
import SignOut from './SignOut'

interface AnyObject {
  [key: string]: any
}

const Me: StatelessComponent<AnyObject> = ({
  me,
  t,
  email
}) =>
  <div>
    {me
      ? <div>
          {t('me/signedinAs', {
            nameOrEmail: me.name || me.email
          })}
          <br />
          <SignOut />
        </div>
      : <SignIn email={email} />}
  </div>

export default compose(withMe, withT)(Me)
