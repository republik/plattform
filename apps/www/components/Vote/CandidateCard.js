import { css } from 'glamor'
import Link from 'next/link'
import compose from 'lodash/flowRight'
import {
  A,
  DEFAULT_PROFILE_PICTURE,
  fontStyles,
  mediaQueries,
  useColorContext,
  renderCommentMdast,
} from '@project-r/styleguide'
import { Strong } from './text'
import voteT from './voteT'
import withT from '../../lib/withT'
import Contact from '../Profile/Contact'

const styles = {
  statement: css({
    marginBottom: 15,
    [mediaQueries.onlyS]: {
      ...fontStyles.serifTitle22,
    },
    ...fontStyles.serifTitle26,
  }),
  roleMobile: css({
    [mediaQueries.mUp]: {
      display: 'none',
    },
  }),
  roleDesktop: css({
    marginTop: 15,
    [mediaQueries.onlyS]: {
      display: 'none',
    },
  }),
  detail: css({
    display: 'flex',
    padding: 15,
    marginTop: 8,
    [mediaQueries.onlyS]: {
      flexDirection: 'column',
    },
  }),
  profile: css({
    display: 'flex',
    paddingRight: 15,
    flexDirection: 'column',
    alignItems: 'start',
    [mediaQueries.onlyS]: {
      flexDirection: 'row',
      marginBottom: 15,
    },
  }),
  portrait: css({
    display: 'block',
    backgroundColor: '#E2E8E6',
    width: 100,
    height: 100,
    minWidth: 100,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'grayscale(1)',
  }),
  moreInfo: css({
    marginTop: 15,
  }),
  externalLinks: css({
    display: 'flex',
  }),
  shortInfo: css({
    [mediaQueries.onlyS]: {
      paddingLeft: 15,
    },
  }),
}

const CandidateCard = compose(
  voteT,
  withT,
)(({ vt, t, candidate, discussionPath, discussionTag }) => {
  const [colorScheme] = useColorContext()
  const { user: d } = candidate
  const role = (candidate.credential || d.credentials?.find((c) => c.isListed))
    ?.description

  return (
    <div {...styles.detail} {...colorScheme.set('backgroundColor', 'alert')}>
      <div {...styles.profile}>
        <div
          style={{
            backgroundImage: `url(${d.portrait || DEFAULT_PROFILE_PICTURE})`,
          }}
          {...styles.portrait}
        />
        <div {...styles.shortInfo}>
          {role && <div {...styles.roleMobile}>{role}</div>}
          {d.username && (
            <>
              <Contact user={d} electionBallot />
              <div style={{ marginTop: 8 }}>
                <Link href={`/~${d.username}`} passHref legacyBehavior>
                  <A>Profil</A>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <div>
        <div {...styles.statement}>{d.statement || 'Ihr Statement'}</div>
        <div {...styles.biography}>
          {d.biographyContent && renderCommentMdast(d.biographyContent)}
        </div>
        <div>
          {discussionPath && candidate.comment && candidate.comment.id && (
            <div>
              <Link
                href={{
                  pathname: discussionPath,
                  query: {
                    discussion: candidate.election.slug,
                    focus: candidate.comment.id,
                    tag: discussionTag,
                  },
                }}
                passHref
                legacyBehavior>
                <A>{vt('vote/election/discussion')}</A>
              </Link>
            </div>
          )}
        </div>
        {role && <div {...styles.roleDesktop}>{role}</div>}
        {d.disclosures && (
          <div {...styles.moreInfo}>
            <Strong>{t('profile/disclosures/label')}:</Strong> {d.disclosures}
          </div>
        )}
        {candidate.recommendation && (
          <div {...styles.moreInfo}>
            <Strong>{vt('vote/election/recommendation')}</Strong>{' '}
            {candidate.recommendation}
          </div>
        )}
      </div>
    </div>
  );
})

export default CandidateCard
