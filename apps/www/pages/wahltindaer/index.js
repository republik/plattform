import { withRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { descending } from 'd3-array'
import { css } from 'glamor'

import withT from '../../lib/withT'
import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../../lib/constants'

import Frame from '../../components/Frame'
import Loader from '../../components/Loader'
import Container from '../../components/Card/Container'
import Cantons, {
  nSeatsPerCanton,
  sSeatsPerCanton,
} from '../../components/Card/Cantons'
import Logo from '../../components/Card/Logo'
import { Editorial, Interaction, IconButton } from '@project-r/styleguide'
import Link from 'next/link'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import { IconCheck, IconDiscussion } from '@republik/icons'

const query = gql`
  query getCardGroups {
    nElected: cards(filters: { elects: ["nationalCouncil"] }) {
      totalCount
    }
    sElected: cards(filters: { elects: ["councilOfStates"] }) {
      totalCount
    }
    cardGroups(first: 50) {
      nodes {
        id
        slug
        name
        cards {
          totalCount
        }
        nElected: cards(filters: { elects: ["nationalCouncil"] }) {
          totalCount
        }
        sElected: cards(filters: { elects: ["councilOfStates"] }) {
          totalCount
        }
        discussion {
          id
          comments {
            id
            totalCount
          }
        }
      }
    }
  }
`

const SIZE = 40
const WIDTH = 275
const MARGIN = 10

const styles = {
  cantons: css({
    maxWidth: WIDTH * 3 + MARGIN * 2 * 3,
    margin: '0 auto',
    textAlign: 'center',
  }),
  canton: css(Interaction.fontRule, {
    verticalAlign: 'top',
    fontSize: 16,
    position: 'relative',
    paddingLeft: SIZE + 10,
    paddingTop: 0,
    display: 'inline-block',
    color: 'var(--color-text)',
    margin: MARGIN,
    textAlign: 'left',
    width: WIDTH,
    height: SIZE + 20,
  }),
  cardCount: css({
    fontFeatureSettings: '"tnum" 1, "kern" 1',
  }),
  cardsLink: css({
    display: 'inline-block',
    minWidth: 130,
    color: 'var(--color-text)',
    textDecoration: 'none',
    '@media(hover)': {
      '[href]:hover > *': {
        opacity: 0.8,
      },
    },
  }),
  discussionLink: css({
    position: 'relative',
    top: 3,
    display: 'inline-block',
    paddingLeft: 10,
    verticalAlign: 'top',
  }),
  flag: css({
    position: 'absolute',
    left: 0,
    top: 0,
  }),
  discussionFeedHeadline: css({
    marginTop: 20,
    marginBottom: 30,
  }),
}

const mdCheckProps = {
  style: { marginTop: -4 },
  fill: 'var(--color-primary)',
}

const Page = ({ data, data: { cardGroups }, router, t }) => (
  <Frame
    raw
    pageColorSchemeKey='light'
    meta={{
      pageTitle: t('pages/cardGroups/pageTitle'),
      title: t('pages/cardGroups/title'),
      description: t('pages/cardGroups/description'),
      url: `${PUBLIC_BASE_URL}/wahltindaer`,
      image: `${CDN_FRONTEND_BASE_URL}/static/social-media/republik-wahltindaer-09.png`,
    }}
  >
    <Container imprint={false}>
      <div
        style={{
          padding: 10,
          maxWidth: 700,
          margin: '40px auto 0',
          textAlign: 'center',
        }}
      >
        <Editorial.Headline>
          {t('pages/cardGroups/headline')}
          <Logo
            style={{
              marginLeft: 20,
              marginBottom: -20,
            }}
            size={80}
          />
        </Editorial.Headline>

        <Editorial.P>
          {t(
            `pages/cardGroups/lead/${
              data.nElected && data.nElected.totalCount === 200
                ? 'complete'
                : 'pending'
            }`,
          )}
          <br />
          <Editorial.A href='/wahltindaer/meta'>
            {t('pages/cardGroups/lead/more')}
          </Editorial.A>
        </Editorial.P>
      </div>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const groups = []
            .concat(cardGroups.nodes)
            .sort((a, b) => descending(a.cards.totalCount, b.cards.totalCount))
          const partyQuery = router.query.party && {
            party: router.query.party,
          }
          const AllFlag = Cantons.bundesversammlung || null

          return (
            <>
              {data.nElected.totalCount === 200 && (
                <Interaction.P
                  style={{ margin: '20px auto', textAlign: 'center' }}
                >
                  <strong>{t('pages/cardGroups/elected')}</strong>
                </Interaction.P>
              )}

              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div
                  {...styles.canton}
                  style={{
                    fontSize: 18,
                    lineHeight: 1.25,
                    height: 'auto',
                    // backgroundColor: '#fff',
                    padding: 10,
                    paddingLeft: 10 + SIZE + 10,
                    width: 10 + WIDTH + 10,
                    margin: 0,
                  }}
                >
                  <Link
                    href={{
                      pathname: '/wahltindaer/[group]',
                      query: { group: 'bundesversammlung', ...partyQuery },
                    }}
                    passHref
                  >
                    <a {...styles.cardsLink}>
                      <AllFlag
                        size={SIZE}
                        style={{ top: 10 + 3, left: 10 }}
                        {...styles.flag}
                      />
                      <strong>{t('pages/cardGroups/elected/title')}</strong>
                      <br />
                      {t('pages/cardGroups/elected/nationalCouncil')}{' '}
                      <strong>{data.nElected.totalCount}</strong>{' '}
                      <IconCheck {...mdCheckProps} />
                      <br />
                      {t('pages/cardGroups/elected/councilOfStates')}{' '}
                      <strong>{data.sElected.totalCount}</strong>{' '}
                      <IconCheck {...mdCheckProps} />
                    </a>
                  </Link>
                </div>
              </div>
              {(data.nElected.totalCount !== 200 ||
                data.sElected.totalCount !== 46) && (
                <Interaction.P
                  style={{
                    padding: 10,
                    margin: '10px auto',
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  {t('pages/cardGroups/elected/open', {
                    nationalCouncil: t.pluralize(
                      'pages/cardGroups/elected/open/nationalCouncil',
                      {
                        count: 200 - (data.nElected.totalCount || 0),
                      },
                    ),
                    councilOfStates: t.pluralize(
                      'pages/cardGroups/elected/open/councilOfStates',
                      {
                        count: 46 - (data.sElected.totalCount || 0),
                      },
                    ),
                  })}
                </Interaction.P>
              )}
              <Interaction.P
                style={{ margin: '40px auto 20px', textAlign: 'center' }}
              >
                <strong>{t('pages/cardGroups/choose')}</strong>
              </Interaction.P>
              <div {...styles.cantons} style={{ opacity: 1 }}>
                {groups.map((cardGroup) => {
                  const Flag = Cantons[cardGroup.slug] || null
                  const commentCount = cardGroup.discussion.comments.totalCount
                  const nSeats = nSeatsPerCanton[cardGroup.slug]
                  const sSeats = sSeatsPerCanton[cardGroup.slug]
                  const openSeats =
                    nSeats -
                    cardGroup.nElected.totalCount +
                    sSeats -
                    cardGroup.sElected.totalCount

                  return (
                    <div {...styles.canton} key={cardGroup.slug}>
                      <Link
                        href={{
                          pathname: '/wahltindaer/[group]',
                          query: { group: cardGroup.slug, ...partyQuery },
                        }}
                        passHref
                      >
                        <a {...styles.cardsLink}>
                          {Flag && <Flag size={SIZE} {...styles.flag} />}
                          <strong>{cardGroup.name}</strong>
                          <br />
                          <span {...styles.cardCount}>
                            {!!(
                              cardGroup.nElected.totalCount ||
                              cardGroup.sElected.totalCount
                            ) && (
                              <>
                                <strong>{cardGroup.nElected.totalCount}</strong>
                                {' + '}
                                <strong>
                                  {cardGroup.sElected.totalCount}
                                </strong>{' '}
                                <IconCheck {...mdCheckProps} />
                              </>
                            )}
                            {!!openSeats && (
                              <>
                                {' '}
                                {openSeats > 2 ? (
                                  <>
                                    {nSeats - cardGroup.nElected.totalCount}
                                    {' + '}
                                    {sSeats - cardGroup.sElected.totalCount}
                                  </>
                                ) : (
                                  openSeats
                                )}
                                &nbsp;{t('pages/cardGroups/openSuffix')}
                              </>
                            )}
                          </span>
                        </a>
                      </Link>
                      {!!commentCount && (
                        <span {...styles.discussionLink}>
                          <Link
                            href={{
                              pathname: '/wahltindaer/[group]/[suffix]',
                              query: {
                                group: cardGroup.slug,
                                suffix: 'diskussion',
                                ...partyQuery,
                              },
                            }}
                            passHref
                          >
                            <IconButton
                              Icon={IconDiscussion}
                              label={commentCount}
                              fill={'var(--color-primary)'}
                            />
                          </Link>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )
        }}
      />
      <br />
      <br />
    </Container>
  </Frame>
)

export default withDefaultSSR(compose(withRouter, withT, graphql(query))(Page))
