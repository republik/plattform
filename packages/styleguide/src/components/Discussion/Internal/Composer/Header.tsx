import { IconCheck } from '@republik/icons'
import { css } from 'glamor'
import { Pencil } from 'lucide-react'
import PropTypes, { InferProps } from 'prop-types'
import React, { useMemo } from 'react'
import { ellipsize } from '../../../../lib/styleMixins'
import { useColorContext } from '../../../Colors/ColorContext'
import {
  sansSerifMedium16,
  sansSerifRegular14,
} from '../../../Typography/styles'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { DisplayAuthorPropType } from '../PropTypes'

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
            <Pencil size={16} />
          </div>
        )}
      </div>
    </button>
  )
}

Header.propTypes = headerPropTypes
