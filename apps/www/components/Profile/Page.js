import { useState, useRef, useEffect, Fragment } from 'react'
import { gql, useQuery } from '@apollo/client'
import { css } from 'glamor'
import { IconButton } from '@project-r/styleguide'
import { useTranslation } from '../../lib/withT'

import Loader from '../Loader'
import Frame, { MainContainer } from '../Frame'
import Box from '../Frame/Box'
import { cardFragment } from '../Card/fragments'
import CardDetails from '../Card/Details'
import SubscribeMenu from '../Notifications/SubscribeMenu'
import ActionBar from '../ActionBar'
import { TESTIMONIAL_IMAGE_SIZE } from '../constants'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'
import Badge from './Badge'
import Comments from './Comments'
import Documents from './Documents'
import Contact from './Contact'
import Portrait from './Portrait'
import Statement from './Statement'
import Biography from './Biography'
import Edit from './Edit'
import Credentials from './Credentials'
import Settings from './Settings'

import {
  A,
  FieldSet,
  fontStyles,
  Interaction,
  mediaQueries,
  usePrevious,
  useHeaderHeight,
  useColorContext,
} from '@project-r/styleguide'
import ElectionBallotRow from '../Vote/ElectionBallotRow'
import { documentListQueryFragment } from '../Feed/DocumentListContainer'
import Link from 'next/link'
import { InnerPaynote } from '../Article/PayNote'
import { useReportUserMutation } from './graphql/useReportUserMutation'
import { IconReport } from '@republik/icons'
import { useMe } from '../../lib/context/MeContext'

const SIDEBAR_TOP = 20
const PORTRAIT_SIZE_M = TESTIMONIAL_IMAGE_SIZE
const PORTRAIT_SIZE_S = 101

const styles = {
  container: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    position: 'relative',
    paddingBottom: 60,
    paddingTop: 10,
    [mediaQueries.mUp]: {
      paddingTop: SIDEBAR_TOP + 5,
    },
  }),
  sidebar: css({
    paddingBottom: '20px',
    [mediaQueries.mUp]: {
      float: 'left',
      width: PORTRAIT_SIZE_M,
    },
  }),
  mainColumn: css({
    [mediaQueries.mUp]: {
      float: 'left',
      paddingLeft: 20,
      width: `calc(100% - ${PORTRAIT_SIZE_M}px)`,
    },
  }),
  head: css({
    position: 'relative',
    paddingTop: 20,
  }),
  statement: css({
    [mediaQueries.mUp]: {
      float: 'right',
      width: `calc(100% - ${PORTRAIT_SIZE_M + 20}px)`,
      paddingBottom: 30,
    },
  }),
  portrait: css({
    width: PORTRAIT_SIZE_S,
    height: PORTRAIT_SIZE_S,
    [mediaQueries.mUp]: {
      width: PORTRAIT_SIZE_M,
      height: PORTRAIT_SIZE_M,
    },
  }),
  headInfo: css({
    ...fontStyles.sansSerifRegular16,
    position: 'absolute',
    bottom: 5,
    right: 0,
    left: PORTRAIT_SIZE_S + 10,
    [mediaQueries.mUp]: {
      left: PORTRAIT_SIZE_M + 20,
    },
  }),
  headInfoNumber: css({
    display: 'inline-block',
    paddingTop: 3,
    float: 'right',
    marginRight: 10,
    verticalAlign: 'middle',
    [mediaQueries.mUp]: {
      marginRight: 0,
      float: 'left',
    },
  }),
  headInfoShare: css({
    display: 'flex',
    float: 'right',
    verticalAlign: 'middle',
  }),
  headInfoReportButton: css({
    marginLeft: 12,
    [mediaQueries.mUp]: {
      marginLeft: 24,
    },
  }),
  badges: css({
    margin: '20px 0 30px 0',
  }),
  candidacy: css({
    marginTop: 0,
    marginBottom: 20,
  }),
}

export const DEFAULT_VALUES = {
  publicUrl: 'https://',
}

const getPublicUser = gql`
  query getPublicUser(
    $slug: String!
    $firstDocuments: Int!
    $firstComments: Int!
    $afterDocument: String
    $afterComment: String
  ) {
    user(slug: $slug) {
      id
      slug
      username
      firstName
      lastName
      updatedAt
      name
      email
      emailAccessRole
      phoneNumber
      phoneNumberNote
      phoneNumberAccessRole
      portrait
      hasPublicProfile
      isEligibleForProfile
      statement
      biography
      biographyContent
      isListed
      isAdminUnlisted
      sequenceNumber
      pgpPublicKey
      pgpPublicKeyId
      credentials {
        isListed
        description
        verified
      }
      facebookId
      twitterHandle
      publicUrl
      badges
      prolitterisId
      documents(first: $firstDocuments, after: $afterDocument) {
        ...DocumentListConnection
      }
      subscribedByMe {
        id
        active
        filters
        object {
          ... on User {
            id
            name
          }
          ... on Document {
            id
            meta {
              title
            }
          }
        }
      }
      comments(first: $firstComments, after: $afterComment) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          published
          adminUnpublished
          preview(length: 210) {
            string
            more
          }
          tags
          parentIds
          discussion {
            id
            title
            path
            document {
              id
              meta {
                title
                path
                template
                ownDiscussion {
                  id
                  closed
                }
                linkedDiscussion {
                  id
                  path
                  closed
                }
              }
            }
          }
          createdAt
        }
      }
      cards(first: 1) {
        nodes {
          id
          ...Card
          group {
            id
            name
            slug
          }
        }
      }
      # # uncomment to show candidacies during elections
      # # and filter in backend to only return currently active elections
      # candidacies {
      #   election {
      #     slug
      #     description
      #     beginDate
      #     endDate
      #     candidacyEndDate
      #     discussion {
      #       id
      #     }
      #   }
      #   id
      #   yearOfBirth
      #   city
      #   recommendation
      #   comment {
      #     id
      #   }
      # }
    }
  }
  ${documentListQueryFragment}
  ${cardFragment}
`

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

const LoadedProfile = ({ t, data: { user, fetchMore }, card, metaData }) => {
  const { me, hasAccess } = useMe()

  const [state, setRawState] = useState({
    isEditing: false,
    showErrors: false,
    values: {},
    errors: {},
    dirty: {},
  })
  const setState = (newState) =>
    setRawState((prevState) => ({
      ...prevState,
      ...(typeof newState === 'function' ? newState(prevState) : newState),
    }))

  const [layout, setLayout] = useState({
    isMobile: false,
    isSticky: false,
  })
  const innerRef = useRef()
  const sidebarInnerRef = useRef()
  const mainRef = useRef()

  const [headerHeight] = useHeaderHeight()
  const currentRef = useRef({})
  currentRef.current.headerHeight = headerHeight
  currentRef.current.layout = layout
  const [reportUserMutation] = useReportUserMutation()

  useEffect(() => {
    const onScroll = () => {
      const { current } = currentRef
      const y = window.pageYOffset
      const mobile = window.innerWidth < mediaQueries.mBreakPoint
      const isSticky =
        !mobile &&
        y + current.headerHeight > current.y + current.innerHeight &&
        current.mainHeight > current.sidebarHeight &&
        current.sidebarHeight <
          window.innerHeight - current.headerHeight - SIDEBAR_TOP

      if (isSticky !== current.layout.isSticky) {
        setLayout((prev) => ({ ...prev, isSticky }))
      }
    }
    const measure = () => {
      const { current } = currentRef
      const isMobile = window.innerWidth < mediaQueries.mBreakPoint
      if (isMobile !== current.layout.isMobile) {
        setLayout((prev) => ({ ...prev, isMobile }))
      }
      if (innerRef.current) {
        const rect = innerRef.current.getBoundingClientRect()
        current.y = window.pageYOffset + rect.top
        current.innerHeight = rect.height
        const x = window.pageXOffset + rect.left
        if (x !== current.layout.x) {
          setLayout((prev) => ({ ...prev, x }))
        }
      }
      if (sidebarInnerRef.current) {
        current.sidebarHeight =
          sidebarInnerRef.current.getBoundingClientRect().height
      }
      if (mainRef.current) {
        current.mainHeight = mainRef.current.getBoundingClientRect().height
      }
      onScroll()
    }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const reportUser = async () => {
    const reportReason = window.prompt(t('profile/report/confirm'))
    if (reportReason === null) {
      return
    }
    if (reportReason.length === 0) {
      alert(t('profile/report/provideReason'))
      return
    }
    const maxLength = 500
    if (reportReason.length > maxLength) {
      alert(
        t('profile/report/tooLong', {
          max: maxLength,
          input: reportReason.slice(0, maxLength) + '…',
          br: '\n',
        }),
      )
      return
    }

    try {
      await reportUserMutation({
        variables: {
          userId: user.id,
          reason: reportReason,
        },
      })
      alert(t('profile/report/success'))
    } catch (e) {
      console.warn(e)
      alert(t('profile/report/error'))
    }
  }

  const isMe = me && me.id === user.id

  const startEditing = () => {
    const { isEditing } = state
    if (!isEditing && isMe) {
      const credential =
        user.credentials && user.credentials.find((c) => c.isListed)
      setState({
        isEditing: true,
        values: {
          ...user,
          publicUrl: user.publicUrl || DEFAULT_VALUES.publicUrl,
          credential: credential && credential.description,
          portrait: undefined,
        },
      })
      window.scrollTo(0, 0)
    }
  }
  const prevUser = usePrevious(user)
  useEffect(() => {
    if (prevUser) {
      return
    }
    if (user && !user.username && user.isEligibleForProfile) {
      startEditing() // will check if it's me
    }
  }, [prevUser, user])

  const onChange = (fields) => {
    startEditing()
    setState(FieldSet.utils.mergeFields(fields))
  }

  const { isEditing, values, errors, dirty } = state

  const shareObject = {
    title: t('profile/share/title', { name: user.name }),
    label: t('profile/share/overlayTitle'),
    url: `${PUBLIC_BASE_URL}/~${user.slug}`,
    emailSubject: t('profile/share/emailSubject', { name: user.name }),
    emailAttachUrl: false,
    emailBody: `${PUBLIC_BASE_URL}/~${user.slug}`,
    overlayTitle: t('profile/share/overlayTitle'),
  }
  const [colorScheme] = useColorContext()
  const showPaynote = !me && !!user.documents?.totalCount
  return (
    <Fragment>
      {!user.hasPublicProfile && (
        <Box>
          <MainContainer>
            <Interaction.P>{t('profile/private')}</Interaction.P>
          </MainContainer>
        </Box>
      )}
      <MainContainer>
        <div ref={innerRef} {...styles.head}>
          <p {...styles.statement}>
            <Statement
              user={user}
              isEditing={isEditing}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
          </p>
          <div {...styles.portrait}>
            <Portrait
              user={user}
              isEditing={isEditing}
              isMe={isMe}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
          </div>
          <div {...styles.headInfo}>
            {!!user.hasPublicProfile && (
              <span {...styles.headInfoShare}>
                <ActionBar
                  share={shareObject}
                  download={isMe ? metaData.image : undefined}
                />
                {!isMe && (
                  <div {...styles.headInfoReportButton}>
                    <IconButton
                      Icon={IconReport}
                      title={t('profile/report/label')}
                      onClick={() => reportUser(user.id)}
                      style={{ margin: 0 }}
                    />
                  </div>
                )}
              </span>
            )}
            {!!user.sequenceNumber && (
              <span {...styles.headInfoNumber}>
                {t('memberships/sequenceNumber/label', {
                  sequenceNumber: user.sequenceNumber,
                })}
              </span>
            )}
            <div style={{ clear: 'both' }} />
          </div>
        </div>
        <div
          {...styles.container}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <div {...styles.sidebar}>
            <div
              style={
                layout.isSticky && !isEditing
                  ? {
                      position: 'fixed',
                      top: `${headerHeight + SIDEBAR_TOP}px`,
                      left: `${layout.x}px`,
                      width: PORTRAIT_SIZE_M,
                    }
                  : {}
              }
            >
              <div ref={sidebarInnerRef}>
                <Interaction.H3>{user.name}</Interaction.H3>
                <Credentials
                  user={user}
                  isEditing={isEditing}
                  onChange={onChange}
                  values={values}
                  errors={errors}
                  dirty={dirty}
                />
                {user.badges && (
                  <div {...styles.badges}>
                    {user.badges.map((badge, i) => (
                      <Badge key={i} badge={badge} size={27} />
                    ))}
                  </div>
                )}
                <Settings
                  user={user}
                  isEditing={isEditing}
                  onChange={onChange}
                  values={values}
                  errors={errors}
                  dirty={dirty}
                />
                <Edit
                  user={user}
                  state={state}
                  setState={setState}
                  startEditing={startEditing}
                  onChange={onChange}
                />
                <Contact
                  user={user}
                  isEditing={isEditing}
                  onChange={onChange}
                  values={values}
                  errors={errors}
                  dirty={dirty}
                  showSupportLink
                />
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
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
              </div>
            </div>
          </div>
          <div {...styles.mainColumn} ref={mainRef}>
            <Biography
              user={user}
              isEditing={isEditing}
              onChange={onChange}
              values={values}
              errors={errors}
              dirty={dirty}
            />
            {card && (
              <div style={{ marginBottom: 40 }}>
                <CardDetails
                  card={card}
                  postElection
                  skipSpider={!card.user.portrait}
                />
              </div>
            )}
            {layout.isMobile && isEditing && (
              <div style={{ marginBottom: 40 }}>
                <Edit
                  user={user}
                  state={state}
                  setState={setState}
                  startEditing={startEditing}
                />
              </div>
            )}
            {user.candidacies?.map((c, i) => (
              <div key={i} style={{ marginBottom: 60 }}>
                <Interaction.H3 style={{ marginBottom: 0 }}>
                  {`${c.election.description}`}
                </Interaction.H3>
                <div style={{ marginTop: 10 }}>
                  <ElectionBallotRow
                    candidate={{ ...c, user }}
                    expanded
                    maxVotes={0}
                    showMeta={false}
                  />
                </div>
                {isMe &&
                  c.election &&
                  new Date() < new Date(c.election.candidacyEndDate) && (
                    <div style={{ marginTop: 10 }}>
                      <Link
                        href={{
                          pathname: '/vote/genossenschaft/kandidieren',
                          query: { edit: true },
                        }}
                        passHref
                        legacyBehavior
                      >
                        <A>Kandidatur bearbeiten</A>
                      </Link>
                    </div>
                  )}
              </div>
            ))}
            <Documents
              customStyles={showPaynote && css({ marginBottom: 0 })}
              documents={user.documents}
              loadMore={makeLoadMore(fetchMore, 'documents', {
                firstComments: 0,
                firstDocuments: 20,
                afterDocument:
                  user.documents.pageInfo && user.documents.pageInfo.endCursor,
              })}
            />
            {showPaynote ? (
              <InnerPaynote
                payNote={{
                  cta: 'trialForm',
                  content: t('profile/tryNote/content', { name: user.name }),
                }}
                trackingPayload={{
                  profile: user.id,
                }}
                hasAccess={hasAccess}
              />
            ) : (
              <Comments
                comments={user.comments}
                loadMore={makeLoadMore(fetchMore, 'comments', {
                  firstDocuments: 0,
                  firstComments: 40,
                  afterComment:
                    user.comments.pageInfo && user.comments.pageInfo.endCursor,
                })}
              />
            )}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      </MainContainer>
    </Fragment>
  )
}

const Profile = ({ user: foundUser }) => {
  const { t } = useTranslation()

  const { loading, error, data, fetchMore } = useQuery(getPublicUser, {
    variables: {
      slug: foundUser.slug,
      firstDocuments: 10,
      firstComments: 10,
    },
  })
  const user = data?.user

  const card = user?.cards?.nodes?.[0]

  const metaData = {
    url: user ? `${PUBLIC_BASE_URL}/~${user.slug}` : undefined,
    image:
      user && user.portrait
        ? `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=628&updatedAt=${encodeURIComponent(
            user.updatedAt,
          )}b2&url=${encodeURIComponent(
            `${PUBLIC_BASE_URL}/community?share=${user.id}`,
          )}`
        : '',
    pageTitle: user
      ? t('pages/profile/pageTitle', { name: user.name })
      : t('pages/profile/empty/pageTitle'),
    title: user
      ? t('pages/profile/title', { name: user.name })
      : t('pages/profile/empty/title'),
  }

  return (
    <Frame meta={metaData} raw>
      <Loader
        loading={loading}
        error={error}
        render={() => {
          return (
            <LoadedProfile
              t={t}
              data={data}
              fetchMore={fetchMore}
              card={card}
              metaData={metaData}
            />
          )
        }}
      />
    </Frame>
  )
}

export default Profile
