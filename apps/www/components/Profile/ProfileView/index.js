import { css } from 'glamor'
import Image from 'next/image'
import Link from 'next/link'
import { IconMailOutline, IconVpnKey } from '@republik/icons'
import {
  fontStyles,
  Interaction,
  mediaQueries,
  IconButton,
  useColorContext,
} from '@project-r/styleguide'

import { useMe } from '../../../lib/context/MeContext'
import { useTranslation } from '../../../lib/withT'
import Credential from '../../Credential'
import SubscribeMenu from '../../Notifications/SubscribeMenu'
import ProfileCommentsAndDocuments from './ProfileCommentsAndDocuments'
import ProfileUrls from './ProfileUrls'

export const PORTRAIT_SIZE = 210

const styles = {
  statement: css({
    ...fontStyles.serifTitle,
    fontSize: 27,
    lineHeight: 1.4,
    marginBottom: 16,
    [mediaQueries.mUp]: {
      fontSize: 32,
    },
  }),
  profileContainer: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  column: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 36,
    [mediaQueries.mUp]: {
      gap: 48,
    },
  }),
  portrait: css({
    width: PORTRAIT_SIZE,
  }),
  sequenceNumber: css({
    marginTop: 8,
  }),
  userInfo: css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...fontStyles.sansSerifRegular16,
  }),
  credentials: css({
    margin: '6px 0 12px',
  }),
  biography: css({
    ...fontStyles.serifRegular19,
  }),
  contactLinks: css({
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    gap: '16',
    [mediaQueries.mUp]: {
      width: PORTRAIT_SIZE,
      gap: '16',
      flexDirection: 'column',
    },
  }),
  hiddenMobile: css({
    display: 'none',
    [mediaQueries.mUp]: {
      display: 'flex',
    },
  }),
  hiddenDesktop: css({
    display: 'flex',
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
}

const makeLoadMore = (fetchMore, dataType, variables) => () =>
  fetchMore({
    updateQuery: (previousResult, { fetchMoreResult }) => {
      const getConnection = (data) => data.user[dataType]
      const prevCon = getConnection(previousResult)
      const moreCon = getConnection(fetchMoreResult)
      const nodes = [...prevCon.nodes, ...moreCon.nodes].filter(
        // deduplicating due to off by one in pagination API
        (node, index, all) => all.findIndex((n) => n.id === node.id) === index,
      )
      return {
        ...previousResult,
        user: {
          ...previousResult.user,
          [dataType]: {
            ...moreCon,
            nodes,
          },
        },
      }
    },
    variables,
  })

const ProfileView = ({ data: { user }, fetchMore }) => {
  const { me } = useMe()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const isMe = me && me.id === user.id

  const listedCredential = user.credentials?.filter((c) => c.isListed)[0]
  return (
    <>
      {isMe && (
        <Link
          style={{
            display: 'flex',
            textDecoration: 'underline',
            marginBottom: 16,
          }}
          href={{
            pathname: `/~${user.slug}`,
            query: { edit: 'true' },
          }}
        >
          {t('profile/edit/start')}
        </Link>
      )}
      {!user.hasPublicProfile && (
        <p
          {...colorScheme.set('backgroundColor', 'alert')}
          style={{ padding: 24, marginBottom: 16 }}
        >
          {t('profile/private')}
        </p>
      )}
      {!!user.statement && <p {...styles.statement}>{`«${user.statement}»`}</p>}
      <div {...styles.profileContainer}>
        <div {...styles.column}>
          <div {...styles.portrait}>
            <Image
              className={css({
                width: '100%',
              })}
              width={PORTRAIT_SIZE}
              height={PORTRAIT_SIZE}
              alt='Profilbild'
              src={user.portrait}
            />
            {!!user.sequenceNumber && (
              <p {...styles.sequenceNumber}>
                {t('memberships/sequenceNumber/label', {
                  sequenceNumber: user.sequenceNumber,
                })}
              </p>
            )}
          </div>
          <div {...styles.contactLinks} {...styles.hiddenMobile}>
            <ProfileUrls user={user} />
            {user.email && user.emailAccessRole === 'PUBLIC' && (
              <IconButton
                Icon={IconMailOutline}
                href={`mailto:${user.email}`}
                label='Email'
                labelShort='Email'
              />
            )}
            {user.pgpPublicKeyId && (
              <div {...styles.contactRow}>
                <IconButton
                  href={`/pgp/${user.username || user.id}.asc`}
                  Icon={IconVpnKey}
                  label={user.pgpPublicKeyId.toUpperCase()}
                  labelShort={user.pgpPublicKeyId.toUpperCase()}
                />
              </div>
            )}
          </div>
        </div>
        <div {...styles.column}>
          <div {...styles.userInfo}>
            <Interaction.H1>{user.name}</Interaction.H1>
            <div {...styles.credentials}>
              {listedCredential && (
                <Credential
                  textColor
                  description={listedCredential.description}
                  verified={listedCredential.verified}
                />
              )}
            </div>
            {!!me && user.subscribedByMe && user.id !== me.id && (
              <SubscribeMenu
                label={t('SubscribeMenu/title')}
                labelShort={t('SubscribeMenu/title')}
                showAuthorFilter
                userHasNoDocuments={!user.documents.totalCount}
                subscriptions={[user.subscribedByMe]}
              />
            )}
          </div>
          {!!user.biography && <p {...styles.biography}>{user.biography}</p>}
          <div {...styles.contactLinks} {...styles.hiddenDesktop}>
            <ProfileUrls user={user} />
            {user.email && user.emailAccessRole === 'PUBLIC' && (
              <IconButton
                Icon={IconMailOutline}
                href={`mailto:${user.email}`}
                label={user.email}
                labelShort={user.email}
              />
            )}
            {user.pgpPublicKeyId && (
              <div {...styles.contactRow}>
                <IconButton
                  href={`/pgp/${user.username || user.id}.asc`}
                  Icon={IconVpnKey}
                  label={user.pgpPublicKeyId.toUpperCase()}
                  labelShort={user.pgpPublicKeyId.toUpperCase()}
                />
              </div>
            )}
          </div>
          <ProfileCommentsAndDocuments
            isMe={isMe}
            user={user}
            documents={user.documents}
            loadMoreDocuments={makeLoadMore(fetchMore, 'documents', {
              firstComments: 0,
              firstDocuments: 20,
              afterDocument:
                user.documents.pageInfo && user.documents.pageInfo.endCursor,
            })}
            comments={user.comments}
            loadMoreComments={makeLoadMore(fetchMore, 'comments', {
              firstDocuments: 0,
              firstComments: 40,
              afterComment:
                user.comments.pageInfo && user.comments.pageInfo.endCursor,
            })}
          />
        </div>
      </div>
    </>
  )
}

export default ProfileView
