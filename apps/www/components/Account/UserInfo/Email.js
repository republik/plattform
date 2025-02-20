import { useState } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import isEmail from 'validator/lib/isEmail'
import {
  Loader,
  InlineSpinner,
  Button,
  Field,
  Interaction,
  Label,
  mediaQueries,
} from '@project-r/styleguide'

import { errorToString } from '../../../lib/utils/errors'
import withT from '../../../lib/withT'
import withMe from '../../../lib/apollo/withMe'
import { query } from '../enhancers'
import { EditButton, HintArea } from '../Elements'

const { P } = Interaction

const styles = {
  container: css({
    margin: '16px 0 24px 0',
    [mediaQueries.mUp]: {
      margin: '24px 0 36px 0',
    },
  }),
  spinner: css({
    display: 'flex',
    alignItems: 'center',
  }),
  alertContainer: css({
    padding: 8,
    margin: '16px 0',
  }),
  buttonsContainer: css({
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  }),
}

export const UserEmail = compose(
  withMe,
  withT,
)(({ me, t }) => {
  return me ? (
    <>
      <Label>{t('Account/Update/email/label')}</Label>
      <P>{me.email}</P>
    </>
  ) : null
})

const InlineLoader = ({ children }) => (
  <div {...styles.spinner}>
    <InlineSpinner size={24} />
    {children}
  </div>
)

const UpdateEmail = ({ t, me, loading, error, updateEmail }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [value, setValue] = useState('')
  const [errorValue, setErrorValue] = useState(false)

  const updateValue = (value) => {
    setValue(value)
    setErrorValue(
      (value.trim().length <= 0 && t('Account/Update/email/empty')) ||
        (!isEmail(value) && t('Account/Update/email/error/invalid')),
    )
  }

  const submit = () => {
    if (!window.confirm(t('Account/Update/email/confirm', { email: value }))) {
      return
    }
    setIsUpdating(true)
    updateEmail({
      email: value,
      userId: me.id,
    })
      .then(() => {
        setIsUpdating(false)
        setIsEditing(false)
      })
      .catch((error) => {
        setIsUpdating(false)
        setErrorValue(errorToString(error))
      })
  }

  return (
    <Loader
      loading={loading || (!me && !error)}
      error={error}
      render={() => (
        <>
          {isUpdating ? (
            <InlineLoader>{t('Account/Update/email/updating')}</InlineLoader>
          ) : isEditing ? (
            <div {...styles.container}>
              <HintArea>{t('Account/Update/email/hint')}</HintArea>
              <Field
                name='email'
                type='email'
                label={t('Account/Update/email/form/label')}
                error={errorValue}
                onChange={(e, value, shouldValidate) => {
                  e.preventDefault()
                  updateValue(value, shouldValidate)
                }}
                value={value}
              />
              <div {...styles.buttonsContainer}>
                <Button
                  primary
                  small
                  disabled={!!errorValue}
                  onClick={() => submit()}
                >
                  {t('Account/Update/email/submit')}
                </Button>
                <Button small onClick={() => setIsEditing(false)}>
                  {t('Account/Update/cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <EditButton onClick={() => setIsEditing(true)}>
              {t('Account/Update/email/edit')}
            </EditButton>
          )}
        </>
      )}
    />
  )
}

const mutation = gql`
  mutation updateEmail($userId: ID!, $email: String!) {
    updateEmail(userId: $userId, email: $email) {
      id
    }
  }
`

export default compose(
  graphql(mutation, {
    props: ({ mutate }) => ({
      updateEmail: (variables) => {
        return mutate({
          variables,
          refetchQueries: [
            {
              query,
            },
          ],
        })
      },
    }),
  }),
  withT,
  withMe,
)(UpdateEmail)
