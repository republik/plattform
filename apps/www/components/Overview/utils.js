import { screenshotUrl } from '@app/lib/util/screenshot-api'
import { PUBLIC_BASE_URL } from '../../lib/constants'

export const renderWidth = 1200
export const getImgSrc = (teaser, path = '/', size = 240) =>
  screenshotUrl({
    url: `${PUBLIC_BASE_URL}/_front${path}?extractId=${teaser.id}`,
    width: renderWidth,
  })

export const getTeasersFromDocument = (doc) => {
  if (!doc) {
    return []
  }
  const children = doc.children
    ? doc.children.nodes.map((c) => c.body)
    : doc.content.children

  return children
    .map((rootChild) => {
      return {
        id: rootChild.data.id,
        contentHash: rootChild.data.contentHash,
        nodes:
          rootChild.identifier === 'TEASERGROUP'
            ? rootChild.children
            : [rootChild],
      }
    })
    .filter(
      (teaser) =>
        teaser.nodes[0].identifier !== 'LIVETEASER' &&
        !(
          teaser.nodes[0].identifier === 'TEASER' &&
          teaser.nodes[0].data &&
          teaser.nodes[0].data.teaserType === 'carousel'
        ),
    )
}
