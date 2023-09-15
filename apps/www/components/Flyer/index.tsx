import React, { useMemo, useState } from 'react'

import {
  Flyer,
  RenderContextProvider,
  SlateRender,
  flyerSchema,
  CustomDescendant,
  CustomElement,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import { useMe } from '../../lib/context/MeContext'

import HrefLink from '../Link/Href'

import { getTileActionBar } from './ActionBar'
import Footer from './Footer'
import getLinkBlocker, { TrialOverlay } from './LinkBlocker'
import Meta from './Meta'
import Nav from './Nav'
import Paynote from './Paynote'

// If no particular tile is in focus (i.e. no share query param),
// we place the paynote right after the first editorial tile.
// Otherwise, we place it after the tile in focus.
const DEFAULT_PAYNOTE_POSITION = 2

export type MetaProps = {
  path: string
  publishDate: string
  title: string
  description: string
  facebookTitle: string
  facebookDescription: string
  twitterTitle: string
  twitterDescription: string
  [x: string]: unknown
}

const RenderValue: React.FC<{
  value: CustomDescendant[]
}> = ({ value }) => (
  <SlateRender
    value={value}
    schema={flyerSchema}
    raw
    skip={['flyerOpeningP']}
  />
)

const RenderWithPaynote: React.FC<{
  value: CustomElement[]
  tileId?: string
  repoId: string
  documentId: string
}> = ({ value, tileId, repoId, documentId }) => {
  const seed = useMemo(() => Math.random(), [])
  let idx = DEFAULT_PAYNOTE_POSITION
  if (tileId) {
    idx = value.findIndex((node) => node.id === tileId) + 1
  }
  return (
    <>
      <RenderValue value={value.slice(0, idx)} />
      <Paynote seed={seed} repoId={repoId} documentId={documentId} />
      <RenderValue value={value.slice(idx)} />
    </>
  )
}

const Page: React.FC<{
  meta: MetaProps
  repoId: string
  documentId: string
  inNativeApp: boolean
  tileId?: string
  value: CustomElement[]
  actionBar: JSX.Element
}> = ({ meta, repoId, documentId, inNativeApp, tileId, value, actionBar }) => {
  const { t } = useTranslation()
  const { hasAccess, hasActiveMembership, meLoading } = useMe()
  const [overlay, showOverlay] = useState<boolean>()

  const contextProps = {
    t,
    Link: hasAccess ? HrefLink : getLinkBlocker(() => showOverlay(true)),
    nav: <Nav repoId={repoId} publishDate={meta.publishDate} />,
    ShareTile: getTileActionBar(documentId, meta, inNativeApp),
  }

  return (
    <>
      <Flyer.Layout>
        <RenderContextProvider {...contextProps}>
          {meLoading || hasActiveMembership ? (
            <RenderValue value={value} />
          ) : (
            <RenderWithPaynote
              value={value}
              tileId={tileId}
              repoId={repoId}
              documentId={documentId}
            />
          )}
        </RenderContextProvider>
        <Footer>{actionBar}</Footer>
        <Meta
          documentId={documentId}
          meta={meta}
          tileId={tileId}
          value={value}
        />
      </Flyer.Layout>
      {overlay && (
        <TrialOverlay
          documentId={documentId}
          repoId={repoId}
          onClose={() => showOverlay(false)}
        />
      )}
    </>
  )
}

export default Page
