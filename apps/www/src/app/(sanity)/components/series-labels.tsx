import { TeaserListItemType } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'

export function getSeriesLabels(teasers: TeaserListItemType[]) {
  const labels = []
  let firstEpisode = 1
  for (const teaser of teasers) {
    // TODO: add use case of a label on the teaser
    if (teaser.heading?.title) {
      labels.push(teaser.heading.title)
    } else {
      labels.push(`Folge ${firstEpisode}`)
      firstEpisode++
    }
  }
  return labels
}
