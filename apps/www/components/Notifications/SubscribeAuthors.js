import SubscribeCheckbox from './SubscribeCheckbox'
import withT from '../../lib/withT'
import SubscribeCalloutTitle from './SubscribeCalloutTitle'

const SubscribeAuthor = ({
  t,
  subscriptions,
  setAnimate,
  showAuthorFilter,
  userHasNoDocuments,
  onlyCommentFilter,
}) => {
  return (
    <>
      {onlyCommentFilter ? (
        <>
          <SubscribeCalloutTitle>
            {t('SubscribeMenu/title')}
          </SubscribeCalloutTitle>
          {subscriptions.map((subscription) => (
            <SubscribeCheckbox
              key={subscription.id}
              subscription={subscription}
              filterName='Comment'
              setAnimate={setAnimate}
              callout
            />
          ))}
        </>
      ) : showAuthorFilter ? (
        <>
          {subscriptions.map((subscription) =>
            (userHasNoDocuments &&
            !(subscription.active && subscription.filters.includes('Document'))
              ? ['Comment']
              : ['Document', 'Comment']
            ).map((filter) => (
              <SubscribeCheckbox
                key={`${subscription.id}-${filter}`}
                subscription={subscription}
                filterName={filter}
                filterLabel
                setAnimate={setAnimate}
                callout
              />
            )),
          )}
        </>
      ) : (
        <>
          <SubscribeCalloutTitle>
            {t('SubscribeMenu/title')}
          </SubscribeCalloutTitle>
          {subscriptions.map((subscription) => (
            <SubscribeCheckbox
              key={subscription.id}
              subscription={subscription}
              filterName='Document'
              setAnimate={setAnimate}
              callout
            />
          ))}
        </>
      )}
    </>
  )
}

export default withT(SubscribeAuthor)
