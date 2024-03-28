import PropTypes from 'prop-types'
import SubscribeDebate from './SubscribeDebate'
import SubscribeDocument from './SubscribeDocument'
import SubscribeAuthors from './SubscribeAuthors'
import { css } from 'glamor'
import { A, Label } from '@project-r/styleguide'
import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'
import Link from 'next/link'

const styles = {
  container: css({
    minWidth: 180,
  }),
  settings: css({
    margin: '10px 0 0',
  }),
}

const SettingsLink = withT(({ t }) => (
  <p {...styles.settings}>
    <small>
      <Link key='link' href='/konto/benachrichtigungen' passHref legacyBehavior>
        <A>{t('SubscribeCallout/settingsLink')}</A>
      </Link>
    </small>
  </p>
))

const SubscribeCallout = ({
  discussionId,
  formatSubscriptions = [],
  authorSubscriptions = [],
  showAuthorFilter,
  userHasNoDocuments,
  setAnimate,
  me,
  t,
}) => {
  const meSubscription = authorSubscriptions.find(
    (subscription) => subscription.object.id === me?.id,
  )

  const authorSubscriptionsWithoutMe = authorSubscriptions.filter(
    (subscription) => subscription !== meSubscription,
  )

  return (
    <div {...styles.container}>
      {formatSubscriptions.length > 0 && (
        <SubscribeDocument
          subscriptions={formatSubscriptions}
          setAnimate={setAnimate}
        />
      )}
      {authorSubscriptionsWithoutMe.length > 0 ? (
        <SubscribeAuthors
          onlyCommentFilter={discussionId}
          showAuthorFilter={showAuthorFilter}
          userHasNoDocuments={userHasNoDocuments}
          subscriptions={authorSubscriptionsWithoutMe}
          setAnimate={setAnimate}
        />
      ) : (
        meSubscription && <Label>{t('SubscribeCallout/onlyYourself')}</Label>
      )}
      {discussionId && (
        <SubscribeDebate discussionId={discussionId} setAnimate={setAnimate} />
      )}
      <SettingsLink />
    </div>
  )
}

SubscribeCallout.propTypes = {
  formatSubscriptions: PropTypes.array,
  authorSubscriptions: PropTypes.array,
}

export default withMe(withT(SubscribeCallout))
