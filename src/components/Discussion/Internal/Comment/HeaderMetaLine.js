import React from 'react'
import RelativeTime from './RelativeTime'
import { useColorContext } from '../../../Colors/ColorContext'
import { timeFormat } from 'd3-time-format'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { convertStyleToRem, pxToRem } from '../../../Typography/utils'
import { sansSerifRegular14 } from '../../../Typography/styles'
import { ellipsize, underline } from '../../../../lib/styleMixins'
import { mediaQueries, useMediaQuery } from '../../../../lib'
import { CheckIcon } from '../../../Icons'

const styles = {
  meta: css({
    ...convertStyleToRem(sansSerifRegular14),
    lineHeight: pxToRem(20),
    display: 'flex',
    alignItems: 'center'
  }),
  credential: css({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 0
  }),
  descriptionText: css({
    ...ellipsize
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: pxToRem(4),
    marginTop: pxToRem(2)
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    '@media (hover)': {
      ':hover': {
        ...underline
      }
    }
  }),
  timeago: css({
    flexShrink: 0,
    flexGrow: 0,
    whiteSpace: 'pre'
  })
}

const dateTimeFormat = timeFormat('%d. %B %Y %H:%M')
const titleDate = string => dateTimeFormat(new Date(string))

/**
 * ============================================================
 * REFACTOR NOTE
 * Make use of this component in the CommentNode to reduce redundancy.
 * ============================================================
 */

/**
 * Render the meta line of the comment-header
 * user credential - published at - edited state
 * @param t
 * @param comment
 * @param Link
 * @returns {JSX.Element}
 * @constructor
 */
const HeaderMetaLine = ({ t, comment, Link }) => {
  const [colorScheme] = useColorContext()
  const isDesktop = useMediaQuery(mediaQueries.mUp)

  const {
    createdAt,
    updatedAt,
    published,
    displayAuthor: { credential }
  } = comment

  const isUpdated = updatedAt && updatedAt !== createdAt

  return (
    <div {...styles.meta} {...colorScheme.set('color', 'textSoft')}>
      {published && credential && (
        <>
          <div
            {...styles.credential}
            title={
              credential.verified
                ? t(
                    'styleguide/comment/header/verifiedCredential',
                    undefined,
                    ''
                  )
                : undefined
            }
          >
            <div
              {...styles.descriptionText}
              {...colorScheme.set(
                'color',
                credential.verified ? 'text' : 'textSoft'
              )}
            >
              {credential.description}
            </div>
            {credential.verified && (
              <CheckIcon
                {...styles.verifiedCheck}
                {...colorScheme.set('color', 'primary')}
              />
            )}
          </div>
          <div style={{ whiteSpace: 'pre' }}>{' · '}</div>
        </>
      )}
      <div
        {...styles.timeago}
        {...colorScheme.set('color', 'textSoft')}
        title={titleDate(createdAt)}
      >
        <Link>
          <a {...styles.linkUnderline}>
            <RelativeTime t={t} isDesktop={isDesktop} date={createdAt} />
          </a>
        </Link>
      </div>
      {published && isUpdated && (
        <div
          {...styles.timeago}
          {...colorScheme.set('color', 'textSoft')}
          title={titleDate(updatedAt)}
        >
          {' · '}
          {t('styleguide/comment/header/updated')}
        </div>
      )}
    </div>
  )
}

HeaderMetaLine.propTypes = {
  t: PropTypes.func.isRequired,
  comment: PropTypes.object.isRequired,
  Link: PropTypes.elementType.isRequired
}

export default HeaderMetaLine
