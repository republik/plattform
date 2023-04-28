import React, { useMemo } from 'react'
import { css } from 'glamor'
import {
  sansSerifMedium16,
  sansSerifRegular14,
} from '../../../Typography/styles'
import { ellipsize } from '../../../../lib/styleMixins'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { useColorContext } from '../../../Colors/ColorContext'
import PropTypes, { InferProps } from 'prop-types'
import { DisplayAuthorPropType } from '../PropTypes'
import { IconCheck } from '@republik/icons'

const buttonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  outline: 'none',
  padding: 0,
}

const styles = {
  button: css({
    ...buttonStyle,
    textAlign: 'left',
    padding: '8px',
    width: '100%',
  }),
  root: css({
    display: 'flex',
    alignItems: 'center',
  }),
  profileRoot: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexGrow: 1,
    overflowX: 'clip',
  }),
  profilePicture: css({
    display: 'block',
    width: pxToRem(40),
    flex: `0 0 40px`,
    height: pxToRem(40),
    marginRight: '8px',
  }),
  center: css({
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 0,
  }),
  name: css({
    ...convertStyleToRem(sansSerifMedium16),
    lineHeight: pxToRem('20px'),
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 1,
    ...ellipsize,
  }),
  meta: css({
    ...convertStyleToRem(sansSerifRegular14),
    lineHeight: pxToRem('20px'),
    display: 'flex',
    alignItems: 'center',
  }),
  credential: css({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0,
  }),
  descriptionText: css({
    ...ellipsize,
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2,
  }),
  action: css({
    ...buttonStyle,
    ...convertStyleToRem(sansSerifRegular14),
    flexShrink: 0,
    height: pxToRem('40px'),
    marginLeft: 12,
    cursor: 'pointer',
    '& svg': {
      display: 'inline-block',
      margin: '8px',
      verticalAlign: 'middle',
    },
  }),
}

const commentHeaderProfilePropTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: DisplayAuthorPropType.isRequired,
  canEditRole: PropTypes.bool,
}

export const CommentHeaderProfile = ({
  t,
  displayAuthor,
  canEditRole,
}: InferProps<typeof commentHeaderProfilePropTypes>) => {
  const { name, profilePicture, credential } = displayAuthor || {}

  const [colorScheme] = useColorContext()

  return (
    <div {...styles.profileRoot}>
      {profilePicture && (
        <img {...styles.profilePicture} src={profilePicture} alt='' />
      )}
      <div {...styles.center}>
        <div {...styles.name} {...colorScheme.set('color', 'text')}>
          {name}
        </div>
        <div {...styles.meta} {...colorScheme.set('color', 'textSoft')}>
          {(() => {
            if (credential) {
              return (
                <div
                  {...styles.credential}
                  {...(credential.verified && colorScheme.set('color', 'text'))}
                >
                  <div {...styles.descriptionText}>
                    {credential.description}
                  </div>
                  {credential.verified && (
                    <IconCheck
                      {...styles.verifiedCheck}
                      {...colorScheme.set('color', 'primary')}
                    />
                  )}
                </div>
              )
            } else if (canEditRole) {
              return (
                <div
                  {...styles.credential}
                  {...colorScheme.set('color', 'primary')}
                >
                  {t('styleguide/comment/header/credentialMissing')}
                </div>
              )
            }
          })()}
        </div>
      </div>
    </div>
  )
}

CommentHeaderProfile.propTypes = commentHeaderProfilePropTypes

const headerPropTypes = {
  t: PropTypes.func.isRequired,
  displayAuthor: DisplayAuthorPropType.isRequired,
  onClick: PropTypes.func,
}

export const Header = ({
  t,
  displayAuthor,
  onClick,
}: InferProps<typeof headerPropTypes>) => {
  const [colorScheme] = useColorContext()

  const hoverStyle = useMemo(
    () =>
      css({
        '@media(hover)': {
          '&:hover': {
            backgroundColor: colorScheme.getCSSColor('alert'),
          },
        },
      }),
    [colorScheme],
  )

  return (
    <button {...styles.button} {...hoverStyle} onClick={onClick}>
      <div {...styles.root}>
        <CommentHeaderProfile
          t={t}
          displayAuthor={displayAuthor}
          canEditRole={!!onClick}
        />
        {onClick && (
          <div {...styles.action} {...colorScheme.set('color', 'primary')}>
            <EditIcon />
          </div>
        )}
      </div>
    </button>
  )
}

Header.propTypes = headerPropTypes

const EditIcon = () => (
  <svg width='24px' height='24px' viewBox='0 0 24 24'>
    <circle fill='currentColor' cx='12' cy='12' r='12' />
    <path
      d='M6,15.5003472 L6,18 L8.49965283,18 L15.8719622,10.6276906 L13.3723094,8.12803777 L6,15.5003472 Z M17.8050271,8.69462575 C18.064991,8.43466185 18.064991,8.01472018 17.8050271,7.75475628 L16.2452437,6.19497292 C15.9852798,5.93500903 15.5653381,5.93500903 15.3053743,6.19497292 L14.0855437,7.4148035 L16.5851965,9.91445633 L17.8050271,8.69462575 Z'
      fill='white'
    />
  </svg>
)
