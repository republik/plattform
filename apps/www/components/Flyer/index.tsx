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
import Stoerer from './Stoerer'

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

const RenderWithStoerer: React.FC<{
  value: CustomDescendant[]
}> = ({ value }) => {
  return (
    <>
      <RenderValue value={value.slice(0, 2)} />
      <Stoerer />
      <RenderValue value={value.slice(2)} />
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
}> = ({ meta, repoId, documentId, inNativeApp, tileId, value, actionBar }) => {
  const { t } = useTranslation()
  const { me } = useMe()

  const contextProps = {
    t,
    Link: HrefLink,
    nav: <Nav repoId={repoId} publishDate={meta.publishDate} />,
    ShareTile: getTileActionBar(documentId, meta, inNativeApp),
  }

  return (
    <Flyer.Layout>
      <RenderContextProvider {...contextProps}>
        {me ? (
          <RenderValue value={value} />
        ) : (
          <RenderWithStoerer value={value} />
        )}
      </RenderContextProvider>
      <Footer>{actionBar}</Footer>
      <Meta documentId={documentId} meta={meta} tileId={tileId} value={value} />
    </Flyer.Layout>
  )
}

export default Page
