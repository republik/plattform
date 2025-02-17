import { useState } from 'react'
import compose from 'lodash/flowRight'

import { Button, colors, Loader, InlineSpinner } from '@project-r/styleguide'

import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'

import { withMyDetails, withMyDetailsMutation } from '../enhancers'

import GenderForm from './Gender'

const Form = ({ me, updateMe }) => {
  const { t } = useTranslation()

  const [meValues, setMeValues] = useState(me)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState()

  return (
    <>
      <GenderForm
        values={meValues}
        onChange={({ values }) => {
          setMeValues({
            ...meValues,
            ...values,
          })
        }}
      />
      {!!error && (
        <div style={{ color: colors.error, marginBottom: 40 }}>{error}</div>
      )}
      <div>
        <Button
          primary
          style={{ width: 100 }}
          disabled={updating}
          small
          onClick={() => {
            setError(undefined)
            setUpdating(true)
            updateMe({
              gender: meValues.genderCustom || meValues.gender,
            })
              .then(() => {
                setUpdating(false)
              })
              .catch((error) => {
                setUpdating(false)
                setError(errorToString(error))
              })
          }}
        >
          {updating ? (
            <InlineSpinner size={24} color='white' />
          ) : (
            t('Account/Update/submit')
          )}
        </Button>
      </div>
    </>
  )
}

const CompactDetailsForm = ({ detailsData, updateDetails }) => {
  const { loading, error, me } = detailsData

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => <Form me={me} updateMe={updateDetails} />}
    />
  )
}

export default compose(withMyDetails, withMyDetailsMutation)(CompactDetailsForm)
