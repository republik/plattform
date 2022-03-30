import { useState, useEffect } from 'react';
import compose from 'lodash/flowRight'

import { Loader } from '@project-r/styleguide'

import withAuthorizeSession from './withAuthorizeSession'
import withMe from '../../lib/apollo/withMe'

const AccessTokenAuthorization = ({
  email,
  accessToken,
  authorizeSession,
  me,
  onSuccess,
}) => {
  const [loaderProps, setLoaderProps] = useState({ loading: true })

  useEffect(() => {
    setLoaderProps({ loading: true })
    authorizeSession({
      email,
      tokens: [{ type: 'ACCESS_TOKEN', payload: accessToken }],
    }).catch((error) => {
      setLoaderProps({ error })
    })
  }, [email, accessToken])

  useEffect(() => {
    if (me) {
      onSuccess(me)
    }
  }, [me, onSuccess])

  return <Loader {...loaderProps} />
}

export default compose(withAuthorizeSession, withMe)(AccessTokenAuthorization)
