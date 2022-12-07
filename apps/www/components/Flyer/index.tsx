import React from 'react'

import {
  Flyer,
  RenderContextProvider,
  SlateRender,
  flyerSchema,
  CustomDescendant,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'
import { useMe } from '../../lib/context/MeContext'

import HrefLink from '../Link/Href'

import { getTileActionBar } from './ActionBar'
import Footer from './Footer'
import Meta from './Meta'
import Nav from './Nav'
import Paynote from './Paynote'

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
  value: CustomDescendant[]
  tileId?: string
  seed: number
  repoId: string
  documentId: string
}> = ({ value, tileId, seed, repoId, documentId }) => {
  let idx = 2
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
  value: CustomDescendant[]
  actionBar: JSX.Element
  payNoteSeed?: number
}> = ({
  meta,
  repoId,
  documentId,
  inNativeApp,
  tileId,
  value,
  actionBar,
  payNoteSeed,
}) => {
  const { t } = useTranslation()
  const { hasActiveMembership, meLoading } = useMe()

  const contextProps = {
    t,
    Link: HrefLink,
    nav: <Nav repoId={repoId} publishDate={meta.publishDate} />,
    ShareTile: getTileActionBar(documentId, meta, inNativeApp),
  }

  return (
    <Flyer.Layout>
      <RenderContextProvider {...contextProps}>
        {meLoading || hasActiveMembership ? (
          <RenderValue value={value} />
        ) : (
          <RenderWithPaynote
            value={value}
            tileId={tileId}
            seed={payNoteSeed}
            repoId={repoId}
            documentId={documentId}
          />
        )}
      </RenderContextProvider>
      <Footer>{actionBar}</Footer>
      <Meta documentId={documentId} meta={meta} tileId={tileId} value={value} />
    </Flyer.Layout>
  )
}

export default Page
