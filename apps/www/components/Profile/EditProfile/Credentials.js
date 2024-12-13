import { Fragment } from 'react'
import { css } from 'glamor'

import FieldSet from '../../FieldSet'
import Credential from '../../Credential'

import { Label, A, fontStyles } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'

const styles = {
  icons: css({
    padding: '15px 0',
  }),
  credential: css({
    display: 'block',
    ...fontStyles.sansSerifRegular16,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
}

const fields = (t) => [
  {
    label: t('profile/credentials/label'),
    name: 'credential',
    validator: (value) =>
      value && value.length > 40 && t('profile/credentials/errors/tooLong'),
  },
]

const Credentials = ({ user, onChange, values, errors, dirty }) => {
  const { t } = useTranslation()
  const credentials = user.credentials || []
  const publicOnes = credentials.filter((c) => c.isListed)
  const privateCreds = credentials.filter((c) => !c.isListed)
  return (
    <div>
      <FieldSet
        values={values}
        errors={errors}
        dirty={dirty}
        onChange={onChange}
        fields={fields(t)}
      />
      {!!privateCreds.length && (
        <Label style={{ display: 'block', marginBottom: 5 }}>
          {t('profile/credentials/private')}
        </Label>
      )}
      {privateCreds
        .concat(publicOnes)
        .filter((c) => c.description !== values.credential)
        .map((c) => (
          <A
            key={c.description}
            href='#use'
            {...styles.credential}
            onClick={(e) => {
              e.preventDefault()
              onChange({
                values: {
                  credential: c.description,
                },
              })
            }}
          >
            <Credential {...c} />
          </A>
        ))}
    </div>
  )
}

export default Credentials
