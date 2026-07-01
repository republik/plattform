import { FeedTeaserType } from '@/app/(sanity)/components/teasers/feed'
import FeedTeaser from '../../../../components/teasers/feed'

// TODO: query here.
// TODO: load first 20. Then more on click

export function TeaserFeed({ items }: { items: FeedTeaserType[] }) {
  return (
    <div>
      {items.map((teaser, index) => (
        <FeedTeaser
          key={teaser._id}
          teaser={teaser}
          index={index}
          skipHeading
        />
      ))}
    </div>
  )
}
