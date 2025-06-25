import { useState } from 'react'
import { css } from 'glamor'

import Portrait from './Portrait'
import Submit from './Submit'
import Credentials from './Credentials'
import PrivacySettings from './PrivacySettings'
import ProfileUrlFields from './ProfileUrlsFields'
import ProlitterisIdField from './ProlitterisIdField'
import PgpPublicKeyField from './PgpPublicKeyField'
import BiographyField from './BiographyField'
import StatementField from './StatementField'
import UsernameField from './UsernameField'
import {
  mediaQueries,
  Dropdown,
  useColorContext,
  fontStyles,
  Container,
} from '@project-r/styleguide'
import Link from 'next/link'
import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../../lib/withT'
import FieldSet from '../../FieldSet'
import { PORTRAIT_SIZE } from '../ProfileView'
import { usePaynotes } from '../../../src/components/paynotes/paynotes-context'

const styles = {
  container: css({
    maxWidth: 840,
    margin: '32px auto',
    [mediaQueries.mUp]: {
      margin: '96px auto',
    },
  }),
  portrait: css({
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
  }),
  editSection: css({
    marginBottom: 48,
    '& h2': {
      ...fontStyles.sansSerifMedium22,
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium24,
      },
    },
    '& p': {
      ...fontStyles.sansSerifRegular16,
    },
  }),
  fields: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    marginTop: 16,
  }),
  h2: css({
    margin: '24px 0 4px',
    [mediaQueries.mUp]: {
      margin: '48px 0 12px',
    },
  }),
  p: css({
    margin: '4px 0',
    [mediaQueries.mUp]: {
      margin: '12px 0',
    },
  }),
}

const EditProfile = ({ data: { user } }) => {
  const { me } = useMe()
  const { t } = useTranslation()
  const isMe = me && me.id === user.id
  const [colorScheme] = useColorContext()
  const { paynoteInlineHeight } = usePaynotes()

  const credential =
    user.credentials && user.credentials.find((c) => c.isListed)

  const [state, setRawState] = useState({
    showErrors: false,
    values: {
      ...user,
      credential: credential && credential.description,
      portrait: undefined,
    },
    errors: {},
    dirty: {},
  })

  const setState = (newState) =>
    setRawState((prevState) => ({
      ...prevState,
      ...(typeof newState === 'function' ? newState(prevState) : newState),
    }))

  const onChange = (fields) => {
    setState(FieldSet.utils.mergeFields(fields))
  }

  const { values, errors, dirty } = state

  return (
    <>
      <Container {...styles.container}>
        <Link
          style={{
            display: 'flex',
            textDecoration: 'underline',
            marginBottom: 16,
          }}
          href={{
            pathname: `/~${user.slug}`,
          }}
        >
          {t('profile/edit/return')}
        </Link>
        <section {...styles.editSection}>
          <div {...styles.portrait}>
            <Portrait
              user={user}
              isEditing={true}
              isMe={isMe}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/username/title')}</h2>
          <p>{t('profile/username/description')}</p>
          <div {...styles.fields}>
            <UsernameField
              user={user}
              values={values}
              errors={errors}
              onChange={onChange}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/credentials/title')}</h2>
          <p>{t('profile/credentials/description')}</p>
          <div {...styles.fields}>
            <Credentials
              user={user}
              isEditing={true}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/section/bio/title')}</h2>
          <p>{t('profile/section/bio/description')}</p>
          <div {...styles.fields}>
            <BiographyField
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={onChange}
              t={t}
            />
            <StatementField
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={onChange}
              t={t}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/section/profileLinks/title')}</h2>
          <p>{t('profile/section/profileLinks/description')}</p>
          <div {...styles.fields}>
            <ProfileUrlFields
              user={user}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/section/privacy/title')}</h2>
          <p>{t('profile/section/privacy/description')}</p>
          <div {...styles.fields}>
            <PrivacySettings
              user={user}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
            <Dropdown
              t={t}
              label={t('profile/contact/email/access/label')}
              value={values.emailAccessRole}
              onChange={(item) => {
                onChange({
                  values: {
                    emailAccessRole: item.value,
                  },
                })
              }}
              items={['ADMIN', 'EDITOR', 'MEMBER', 'PUBLIC'].map((value) => ({
                value: value,
                text: t(`profile/contact/access/${value}`),
              }))}
            />
          </div>
        </section>
        <section {...styles.editSection}>
          <h2>{t('profile/section/other/title')}</h2>
          <div {...styles.fields}>
            <PgpPublicKeyField
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={onChange}
              t={t}
            />
            <ProlitterisIdField
              values={values}
              errors={errors}
              dirty={dirty}
              onChange={onChange}
              t={t}
            />
          </div>
        </section>
      </Container>
      <div
        style={{
          borderWidth: 1,
          borderStyle: 'solid',          position: 'sticky',
          bottom: paynoteInlineHeight || 0,
          padding: '8px 15px',
          width: '100%',
        }}
        {...colorScheme.set('backgroundColor', 'default')}
        {...colorScheme.set('borderColor', 'divider')}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <Submit
            user={user}
            state={state}
            setState={setState}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  )
}

export default EditProfile
