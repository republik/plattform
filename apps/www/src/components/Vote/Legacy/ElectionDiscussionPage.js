import Frame from '../../Frame'
import { withRouter } from 'next/router'
import {
  A,
  colors,
  Interaction,
  Center,
  fontStyles,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import voteT from '../voteT'
import { Body, Section, Strong, Title } from '../text'
import Loader from '../../Loader'
import Link from 'next/link'
import DiscussionContextProvider from '../../Discussion/context/DiscussionContextProvider'
import Discussion from '../../Discussion/Discussion'
import { IconDiscussion } from '@republik/icons'

const { P } = Interaction

const ELECTION_COOP_MEMBERS_SLUG = 'gen18m'
const ELECTION_COOP_PRESIDENT_SLUG = 'gen18p'
const VOTING_COOP_BOARD_SLUG = 'gen18board'

const DISCUSSION_TITLES = {
  [VOTING_COOP_BOARD_SLUG]: 'vote/discussion/board',
  [ELECTION_COOP_PRESIDENT_SLUG]: 'vote/discussion/president',
  [ELECTION_COOP_MEMBERS_SLUG]: 'vote/discussion/members',
}

const styles = {
  tabBarWRapper: css({
    margin: '0 -10px',
    padding: '0 10px',
    position: 'sticky',
    zIndex: 10,
    top: 0,
  }),
  tabBar: css({
    padding: '10px 0px 20px 0px',
    borderTop: `0.5px solid ${colors.divider}`,
  }),
  tab: css({
    marginRight: 20,
    display: 'inline-block',
  }),
  count: css({
    marginLeft: 10,
    color: colors.primary,
    ...fontStyles.sansSerifMedium16,
  }),
}

const DiscussionPage = ({ router, data, vt }) => {
  const [colorScheme] = useColorContext()

  const meta = {
    title: vt('info/title'),
    description: vt('info/description'),
  }

  return (
    <Frame meta={meta}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          const isValid = DISCUSSION_TITLES[router.query.discussion]
          const selectedDiscussion = isValid
            ? router.query.discussion
            : VOTING_COOP_BOARD_SLUG
          const discussionPath = data[selectedDiscussion]?.discussion.path
          const translationKey = DISCUSSION_TITLES[selectedDiscussion]

          return (
            <Center>
              <Title>{vt('vote/discussion/title')}</Title>
              <Section>
                <Body dangerousHTML={vt('vote/discussion/intro')} />
              </Section>
              <div>
                <div
                  {...styles.tabBarWRapper}
                  {...colorScheme.set('background', 'default')}
                >
                  <div {...styles.tabBar}>
                    {[
                      VOTING_COOP_BOARD_SLUG,
                      ELECTION_COOP_PRESIDENT_SLUG,
                      ELECTION_COOP_MEMBERS_SLUG,
                    ].map((id) => (
                      <div key={id} {...styles.tab}>
                        <P>
                          {selectedDiscussion === id ? (
                            <Strong>
                              {vt(`${DISCUSSION_TITLES[id]}Title`)}
                              <span {...styles.count}>
                                <IconDiscussion
                                  size={17}
                                  fill={colors.primary}
                                />{' '}
                                {data[id] &&
                                  data[id].discussion.comments.totalCount}
                              </span>
                            </Strong>
                          ) : (
                            <Link
                              href={{
                                pathname: '/vote/genossenschaft/diskutieren',
                                query: {
                                  discussion:
                                    (data[id] && data[id].discussion.slug) ||
                                    id,
                                },
                              }}
                              passHref
                              scroll={false}
                              legacyBehavior
                            >
                              <A>
                                {vt(`${DISCUSSION_TITLES[id]}Title`)}
                                <span {...styles.count}>
                                  <IconDiscussion
                                    size={17}
                                    fill={colors.primary}
                                  />{' '}
                                  {data[id] &&
                                    data[id].discussion.comments.totalCount}
                                </span>
                              </A>
                            </Link>
                          )}
                        </P>
                      </div>
                    ))}
                  </div>
                </div>
                <Body dangerousHTML={vt(`${translationKey}Intro`)} />
                <DiscussionContextProvider discussionPath={discussionPath}>
                  <Discussion />
                </DiscussionContextProvider>
              </div>
            </Center>
          )
        }}
      />
    </Frame>
  )
}

const query = gql`
  query VoteElectionDiscussionPage {
  ${ELECTION_COOP_PRESIDENT_SLUG}: election(slug: "${ELECTION_COOP_PRESIDENT_SLUG}") {
    id
    discussion {
      id
      comments {
        id
        totalCount
      }
    }
   }
  ${ELECTION_COOP_MEMBERS_SLUG}: election(slug: "${ELECTION_COOP_MEMBERS_SLUG}") {
    id
    discussion {
      id
      comments {
        id
        totalCount
      }
    }
   }
  ${VOTING_COOP_BOARD_SLUG}: voting(slug: "${VOTING_COOP_BOARD_SLUG}") {
    id
    discussion {
      id
      comments {
        id
        totalCount
      }
    }
   }
  }
`

export default compose(voteT, withRouter, graphql(query))(DiscussionPage)
