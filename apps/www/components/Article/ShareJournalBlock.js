import { Fragment } from 'react'
import Head from 'next/head'
import { SlateRender, ColorContextProvider } from '@project-r/styleguide'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../lib/constants'

export const ShareJournalButton = ({ blockId }) => {
  /*const shareImage = `${ASSETS_SERVER_BASE_URL}/render?viewport=450x1&zoomFactor=2&updatedAt=${encodeURIComponent(
    `${documentId}${meta.format ? `-${meta.format.id}` : ''}`,
  )}&url=${encodeURIComponent(
    `${PUBLIC_BASE_URL}${meta.path}?extract=${blockId}`,
  )}`
  console.log({ shareImage })*/
  return <span>{blockId}</span>
}

const ShareJournalBlock = ({ blockId, value, schema }) => {
  return (
    <Fragment>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <ColorContextProvider colorSchemeKey='light'>
        <SlateRender
          value={value.filter((block) => block.id === blockId)}
          schema={schema}
          skip={['flyerMetaP']}
        />
      </ColorContextProvider>
    </Fragment>
  )
}
export default ShareJournalBlock
