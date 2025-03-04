import { useState } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'

import { Interaction, RawHtml, Field, colors } from '@project-r/styleguide'

import { useTranslation } from '../../../lib/withT'
import { errorToString } from '../../../lib/utils/errors'

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

const NotEligible = ({ hide }) => {
  const { t } = useTranslation()
  if (hide) {
    return null
  }
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

const Form = withMyDetailsMutation(({ me, updateDetails, title }) => {
  const { t } = useTranslation()

  const [birthyear, setBirthyear] = useState(me?.birthyear?.toString() || '')
  const [genderValues, setGenderValues] = useState({ gender: me.gender })
  const [error, setError] = useState()

  return (
    <>
      {!!title && <Interaction.H3>{title}</Interaction.H3>}
      <div style={{ marginTop: 5 }}>
        <Field
          label={t('Account/Update/birthyear/label/optional')}
          value={birthyear}
          onBlur={() => {
            console.log('onBlur')
            setError()
            updateDetails({
              birthyear:
                birthyear && birthyear.length ? parseInt(birthyear) : null,
            })
              .then(() => {})
              .catch((e) => {
                setError(errorToString(e))
              })
          }}
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
        {!!error && (
          <div style={{ color: colors.error, marginBottom: 40 }}>{error}</div>
        )}
        <GenderForm
          values={genderValues}
          onChange={({ values }) => {
            setGenderValues(values)
          }}
          autosubmit
        />
      </div>
    </>
  )
})

const CompactDetailsForm = ({ detailsData, title, hideIfNotEligible }) => {
  const { loading, error, me } = detailsData

  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        me ? (
          <Form me={me} title={title} />
        ) : (
          <NotEligible hide={hideIfNotEligible} />
        )
      }
    />
  )
}

export default compose(withMyDetails, withMyDetailsMutation)(CompactDetailsForm)
