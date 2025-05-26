import React from 'react'

import { CustomElement, renderSlateAsText } from '@project-r/styleguide'

import { PUBLIC_BASE_URL } from '../../lib/constants'
import { useTranslation } from '../../lib/withT'

import { getCacheKey } from '../Article/metadata'
import Meta from '../Frame/Meta'

import { screenshotUrl } from '@app/lib/util/screenshot-api'
import { MetaProps } from './index'

export const getShareImageUrls = (
  documentId: string,
  meta: MetaProps,
  tileId: string,
  showAll?: boolean,
): {
  screenshotUrl: string
  shareImageUrl: string
} => {
  const pageUrl = new URL(meta.path, PUBLIC_BASE_URL)
  pageUrl.searchParams.set('extract', tileId)

  if (showAll) {
    pageUrl.searchParams.set('showAll', 'true')
  }

  const dimensions = showAll ? [760, 1] : [600, 314]

  const shareImageUrl = screenshotUrl({
    url: pageUrl.toString(),
    width: dimensions[0],
    height: dimensions[1],
    version: getCacheKey(documentId, meta),
  })

  return {
    screenshotUrl: pageUrl.toString(),
    shareImageUrl: shareImageUrl.toString(),
  }
}

const getTitleProps = (
  value: CustomElement[],
  tileId: string,
  customDescription: string,
): Partial<MetaProps> => {
  const titleNode = value
    .find((node) => node.id === tileId)
    ?.children.find((node: CustomElement) => node.type === 'flyerTitle')

  if (!titleNode) return {}

  const title = `Republik-Journal: ${renderSlateAsText([titleNode])}`

  return {
    title,
    facebookTitle: title,
    twitterTitle: title,
    description: customDescription,
    facebookDescription: customDescription,
    twitterDescription: customDescription,
  }
}

const FlyerMeta: React.FC<{
  documentId: string
  tileId?: string
  meta: MetaProps
  value: CustomElement[]
}> = ({ tileId, meta, documentId, value }) => {
  const { t } = useTranslation()

  // Render as usual
  if (!tileId && meta) {
    return <Meta data={meta} />
  }

  const { shareImageUrl } = getShareImageUrls(documentId, meta, tileId)

  return (
    <Meta
      data={{
        ...meta,
        ...getTitleProps(value, tileId, t('article/flyer/tile/description')),
        image: shareImageUrl.toString(),
        twitterImage: shareImageUrl.toString(),
        facebookImage: shareImageUrl.toString(),
        url: `${PUBLIC_BASE_URL}${meta.path}?share=${tileId}`,
      }}
    />
  )
}

export default FlyerMeta
