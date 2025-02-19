import { useState } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'

import {
  Button,
  colors,
  InlineSpinner,
  Interaction,
  RawHtml,
  Field,
} from '@project-r/styleguide'

import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'

import { withMyDetails, withMyDetailsMutation } from '../enhancers'

import Box from '../../Frame/Box'
import Loader from '../../Loader'

import GenderForm from './Gender'

export const styles = {
  mask: css({
    '::placeholder': {
      color: 'transparent',
    },
    ':focus': {
      '::placeholder': {
        color: '#ccc',
      },
    },
  }),
}

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

  const [birthyear, setBirthyear] = useState(me?.birthyear?.toString() || '')
  const [genderValues, setGenderValues] = useState({ gender: me.gender })
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState()

  return (
    <>
      {!!title && <Interaction.H3>{title}</Interaction.H3>}
      <div style={{ marginTop: 5 }}>
        <GenderForm
          values={genderValues}
          onChange={({ values }) => {
            setGenderValues(values)
          }}
        />
        <Field
          label={t('Account/Update/birthyear/label/optional')}
          value={birthyear}
          onChange={(_, value) => {
            setBirthyear(value)
          }}
          renderInput={(inputProps) => (
            <MaskedInput
              {...inputProps}
              {...styles.mask}
              placeholderChar='_'
              mask='1111'
            />
          )}
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
              gender: genderValues.genderCustom || genderValues.gender,
              birthyear:
                birthyear && birthyear.length ? parseInt(birthyear) : null,
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

  console.log('CompactDetailsForm', { loading, error, me })

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
