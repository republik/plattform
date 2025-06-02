import React from 'react'
import PropTypes from 'prop-types'
import Head from 'next/head'
import { css } from 'glamor'
import Footer from './Footer'
import { META_ROBOTS } from '../lib/publicEnv'
import { Center } from '@project-r/styleguide'

import 'glamor/reset'
import { imageResizeUrl } from '@republik/mdast-react-render'

css.global('html', { boxSizing: 'border-box' })
css.global('*, *:before, *:after', { boxSizing: 'inherit' })

css.global('body', {
  fontFamily: 'serif',
  fontSize: 18,
  color: '#444',
  WebkitFontSmoothing: 'antialiased',
})
css.global('.base h1, .base h2, .base h3', {
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  lineHeight: '1.2em',
  margin: '0 0 0.2em',
})
css.global('.base h1', {
  fontSize: 36,
})
css.global('.base h2', {
  fontSize: 28,
})
css.global('.base h3', {
  fontSize: 18,
})
css.global('.base p', {
  margin: '0 0 0.8em',
})
css.global('.base img', {
  maxWidth: '100%',
})
css.global('a, a:visited', {
  color: '#222',
  textDecoration: 'underline',
})
css.global('a:hover', {
  color: '#444',
})

css.global('.base ul', {
  listStyleType: 'disc',
  margin: '0 0 1em',
  paddingLeft: 30,
})

export const PADDING = 20

export const Paragraph = ({ children, ...props }) => (
  <p {...props}>{children}</p>
)

export const ListItem = ({ children }) => <li>{children}</li>

export const List = ({ children, data }) =>
  data.ordered ? <ol start={data.start}>{children}</ol> : <ul>{children}</ul>

const Layout = ({ children, meta, cover, raw }) => {
  const facebookImage = meta && (meta.facebookImage || meta.image)
  const twitterImage = meta && (meta.twitterImage || meta.image)

  return (
    <div className='base'>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link
          rel='shortcut icon'
          href='https://assets.project-r.construction/images/favicon.ico'
        />
        <link rel='alternate' href='https://project-r.ch' />
        <meta name='author' content='Project R' />
      </Head>

      {!!meta && (
        <Head>
          <title>{meta.title}</title>
          {!!META_ROBOTS && <meta name='robots' content={META_ROBOTS} />}
          <meta name='description' content={meta.description} />
          <meta property='og:type' content='website' />
          <meta property='og:url' content={meta.url} />
          <meta
            property='og:title'
            content={meta.facebookTitle || meta.title}
          />
          <meta
            property='og:description'
            content={meta.facebookDescription || meta.description}
          />
          {facebookImage && (
            <meta property='og:image' content={facebookImage} />
          )}
          <meta property='fb:app_id' content='1774637906137716' />
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:site' content='@_Project_R' />
          <meta name='twitter:creator' content='@_Project_R' />
          <meta
            name='twitter:title'
            content={meta.twitterTitle || meta.title}
          />
          <meta
            name='twitter:description'
            content={meta.twitterDescription || meta.description}
          />
          {twitterImage && (
            <meta
              name='twitter:image:src'
              content={imageResizeUrl(twitterImage, '1500x')}
            />
          )}
        </Head>
      )}

      {cover}
      {!!raw && children}

      <Center>
        {!raw && children}

        <Footer />
      </Center>
    </div>
  )
}

Layout.propTypes = {
  cover: PropTypes.node,
  meta: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }),
}

export default Layout
