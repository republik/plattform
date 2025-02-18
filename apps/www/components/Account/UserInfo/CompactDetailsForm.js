import { useState } from 'react'
import compose from 'lodash/flowRight'

import {
  Button,
  colors,
  InlineSpinner,
  Interaction,
  RawHtml,
} from '@project-r/styleguide'

import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'

import { withMyDetails, withMyDetailsMutation } from '../enhancers'

import Box from '../../Frame/Box'
import Loader from '../../Loader'

import GenderForm from './Gender'

const NotEligible = () => {
  const { t } = useTranslation()
  return (
    <Box style={{ padding: 15 }}>
      <RawHtml
        type={Interaction.P}
        dangerouslySetInnerHTML={{
          __html: t('Account/Update/notEligible'),
        }}
      />
    </Box>
  )
}

const Form = ({ me, updateMe, title }) => {
  const { t } = useTranslation()

  const [meValues, setMeValues] = useState(me)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState()

  return (
    <>
      {!!title && <Interaction.H3>{title}</Interaction.H3>}
      <div style={{ marginTop: 5 }}>
        <GenderForm
          values={meValues}
          onChange={({ values }) => {
            setMeValues({
              ...meValues,
              ...values,
            })
          }}
        />
      </div>
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

const CompactDetailsForm = ({ detailsData, updateDetails, title }) => {
  const { loading, error, me } = detailsData

  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        me ? (
          <Form me={me} updateMe={updateDetails} title={title} />
        ) : (
          <NotEligible />
        )
      }
    />
  )
}

export default compose(withMyDetails, withMyDetailsMutation)(CompactDetailsForm)
