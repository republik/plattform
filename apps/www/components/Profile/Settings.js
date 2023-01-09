import { Fragment } from 'react'
import { Label, Checkbox, A } from '@project-r/styleguide'

import withT from '../../lib/withT'
import UsernameField from './UsernameField'
import Link from 'next/link'

const Settings = ({ user, isEditing, onChange, values, errors, t }) => {
  if (!isEditing) {
    return null
  }

  return (
    <div style={{ marginTop: 20 }}>
      {!user.isEligibleForProfile && (
        <Label>
          {t('profile/settings/isEligibleForProfile/notEligible')}
          <br />
          <br />
        </Label>
      )}
      {user.isAdminUnlisted && (
        <Label>
          {t('profile/settings/isAdminUnlisted/note')}
          <br />
          <br />
        </Label>
      )}
      <ListedCheckbox user={user} values={values} onChange={onChange} />
      <br />
      <PublicCheckbox user={user} values={values} onChange={onChange} />

      <div style={{ marginTop: 5 }}>
        <UsernameField
          user={user}
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export const ListedCheckbox = withT(({ user, values, onChange, t }) => (
  <div style={{ opacity: user.isAdminUnlisted ? 0.5 : 1 }}>
    <Checkbox
      checked={values.isListed}
      disabled={
        !(
          user.isListed ||
          ((user.statement || values.statement) &&
            (user.portrait || values.portrait))
        ) ||
        (!user.isListed && !user.isEligibleForProfile)
      }
      onChange={(_, checked) => {
        onChange({
          values: {
            isListed: checked,
          },
        })
      }}
    >
      {t('profile/settings/isListed/label')}
    </Checkbox>
    <br style={{ clear: 'left' }} />
    <Label>
      {t.elements(`profile/settings/isListed/${!!values.isListed}/note`, {
        communityLink: (
          <Link key='communityLink' href='/community' passHref>
            <A target='_blank'>{t('profile/settings/privacy/communityLink')}</A>
          </Link>
        ),
      })}
    </Label>
  </div>
))

export const PublicCheckbox = withT(({ user, values, onChange, t }) => (
  <Fragment>
    <Checkbox
      checked={values.hasPublicProfile}
      disabled={!user.hasPublicProfile && !user.isEligibleForProfile}
      onChange={(_, checked) => {
        onChange({
          values: {
            hasPublicProfile: checked,
          },
        })
      }}
    >
      {t('profile/settings/hasPublicProfile/label')}
    </Checkbox>
    <br style={{ clear: 'left' }} />
    <Label>
      {t(`profile/settings/hasPublicProfile/${!!values.hasPublicProfile}/note`)}
    </Label>
  </Fragment>
))

export default withT(Settings)
