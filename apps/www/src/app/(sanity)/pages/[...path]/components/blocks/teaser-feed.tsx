import FeedTeaser, {
  FeedTeaserType,
} from '@/app/(sanity)/components/teaser/feed'

export async function TeaserFeed({ teasers }: { teasers: FeedTeaserType[] }) {
  return (
    <div>
      {teasers.map((teaser, index) => (
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
