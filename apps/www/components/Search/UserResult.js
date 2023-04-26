import { useMemo } from 'react'
import { css } from 'glamor'
import { CheckIcon } from '@project-r/styleguide'

import {
  Editorial,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { findHighlight } from '../../lib/utils/mdast'
import { formatExcerpt } from '../../lib/utils/format'
import Link from 'next/link'

export const profilePictureSize = 70
export const profilePictureMargin = 10
const profilePictureBorderSize = 5

const styles = {
  root: css({
    display: 'flex',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: '0 0 40px 0',
    paddingTop: 12,
  }),
  highlight: css({
    '& em': {
      fontStyle: 'inherit',
      fontFamily: 'inherit',
    },
  }),
  profilePicture: css({
    display: 'block',
    width: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    flexGrow: 0,
    flexShrink: 0,
    height: `${profilePictureSize + 2 * profilePictureBorderSize}px`,
    marginRight: 15,
  }),
  meta: css({
    alignSelf: 'stretch',
    display: 'block',
    flexDirection: 'column',
    justifyContent: 'center',
    width: `calc(100% - ${profilePictureSize + profilePictureMargin}px)`,
  }),
  name: css({
    ...fontStyles.sansSerifMedium20,
    lineHeight: '24px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: 2,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium22,
    },
  }),
  description: css({
    ...fontStyles.sansSerifRegular14,
    display: 'flex',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
      lineHeight: '24px',
    },
  }),
  verifiedCheck: css({
    flexShrink: 0,
    display: 'inline-block',
    marginLeft: 4,
    marginTop: -2,
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

export const UserResult = ({ node }) => {
  const {
    entity: { id, slug, firstName, lastName, credentials, portrait },
  } = node
  // TODO: show comments/article count on search page
  const nameHighlight = findHighlight(node, 'name')
  const textHighlight =
    findHighlight(node, 'biography') || findHighlight(node, 'statement')
  const credential = credentials && credentials.find((c) => c.isListed)
  const [colorScheme] = useColorContext()
  const highlightEMRule = useMemo(
    () =>
      css({
        '& em': {
          background: colorScheme.getCSSColor('overlayInverted'),
          color: colorScheme.getCSSColor('textInverted'),
        },
      }),
    [colorScheme],
  )
  return (
    <div>
      <div {...styles.root} {...colorScheme.set('borderColor', 'text')}>
        {portrait && (
          <Link href={`/~${slug || id}`} passHref {...styles.link}>
            <img
              {...styles.profilePicture}
              src={portrait}
              alt={`${firstName} ${lastName}`}
            />
          </Link>
        )}
        <div {...styles.meta}>
          <div {...styles.name} {...colorScheme.set('color', 'text')}>
            <Link href={`/~${slug || id}`} passHref {...styles.link}>
              <span
                {...styles.highlight}
                {...highlightEMRule}
                dangerouslySetInnerHTML={{
                  __html: nameHighlight
                    ? nameHighlight.fragments[0]
                    : `${firstName} ${lastName}`,
                }}
              />
            </Link>
          </div>
          {credential && (
            <div {...styles.description} {...colorScheme.set('color', 'text')}>
              <div
                {...styles.descriptionText}
                {...colorScheme.set(
                  'color',
                  credential.verified ? 'text' : 'textSoft',
                )}
              >
                {credential.description}
              </div>
              {credential.verified && (
                <CheckIcon
                  {...styles.verifiedCheck}
                  {...colorScheme.set('fill', 'primary')}
                />
              )}
            </div>
          )}
        </div>
      </div>
      {!nameHighlight && textHighlight && (
        <Editorial.P style={{ margin: '-20px 0 10px' }}>
          <span
            {...styles.highlight}
            dangerouslySetInnerHTML={{
              __html: formatExcerpt(textHighlight.fragments[0]),
            }}
          />
        </Editorial.P>
      )}
    </div>
  )
}

export default UserResult
