import React, { ReactNode } from 'react'

import {
  Flyer,
  RenderContextProvider,
  SlateRender,
  flyerSchema,
  CustomDescendant,
  CustomElement,
} from '@project-r/styleguide'

import { useTranslation } from '../../lib/withT'

import HrefLink from '../Link/Href'

import { getTileActionBar } from './ActionBar'
import Footer from './Footer'
import Meta from './Meta'
import Nav from './Nav'

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

const Page: React.FC<{
  meta: MetaProps
  repoId: string
  documentId: string
  inNativeApp: boolean
  tileId?: string
  value: CustomElement[]
  actionBar: ReactNode
}> = ({ meta, repoId, documentId, inNativeApp, tileId, value, actionBar }) => {
  const { t } = useTranslation()

  const contextProps = {
    t,
    Link: HrefLink,
    nav: <Nav repoId={repoId} publishDate={meta.publishDate} />,
    ShareTile: getTileActionBar(documentId, meta, inNativeApp),
  }

  return (
    <>
      <Flyer.Layout>
        <RenderContextProvider {...contextProps}>
          <RenderValue value={value} />
        </RenderContextProvider>
        <Footer>{actionBar}</Footer>
        <Meta
          documentId={documentId}
          meta={meta}
          tileId={tileId}
          value={value}
        />
      </Flyer.Layout>
    </>
  )
}

export default Page
