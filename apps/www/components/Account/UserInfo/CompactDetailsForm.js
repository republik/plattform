import { useState } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import MaskedInput from 'react-maskedinput'

import {
  Interaction,
  RawHtml,
  Field,
} from '@project-r/styleguide'

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

const Form = withMyDetailsMutation(({ me, updateDetails, title }) => {
  const { t } = useTranslation()

  const [birthyear, setBirthyear] = useState(me?.birthyear?.toString() || '')
  const [genderValues, setGenderValues] = useState({ gender: me.gender })

  return (
    <>
      {!!title && <Interaction.H3>{title}</Interaction.H3>}
      <div style={{ marginTop: 5 }}>
        <Field
          label={t('Account/Update/birthyear/label/optional')}
          value={birthyear}
          onBlur={() => updateDetails({
            birthyear:
              birthyear && birthyear.length ? parseInt(birthyear) : null,
          })}
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

const CompactDetailsForm = ({ detailsData, title }) => {
  const { loading, error, me } = detailsData

  return (
    <Loader
      loading={loading}
      error={error}
      render={() =>
        me ? (
          <Form me={me} title={title} />
        ) : (
          <NotEligible />
        )
      }
    />
  )
}

export default compose(withMyDetails, withMyDetailsMutation)(CompactDetailsForm)
