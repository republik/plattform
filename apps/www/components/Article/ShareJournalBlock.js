import { Fragment } from 'react'
import Head from 'next/head'
import { SlateRender, ColorContextProvider } from '@project-r/styleguide'

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
