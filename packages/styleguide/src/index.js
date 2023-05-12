import 'core-js/features/array/from'
import 'core-js/features/array/find'
import 'core-js/es'

import React, { Fragment, useState } from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { Catalog, ReactSpecimen } from '@catalog/core'
import { simulations, speedy, css, merge } from 'glamor'
import theme from './catalogTheme'
import './global.css'
import './catalogTheme.css'
import * as fontStyles from './components/Typography/styles'

import { fontFaces } from './theme/fonts'
import { createFormatter } from './lib/translate'
import { DiscussionContext } from './components/Discussion/DiscussionContext'
import { createSampleDiscussionContextValue } from './components/Discussion/DiscussionContext.docs'
import {
  ColorContextProvider,
  useColorContext,
} from './components/Colors/ColorContext'
import { DarkmodeIcon } from './components/Icons'

simulations(true)
// prevent speedy in catalog
// - iframe rendering (e.g. responsive preview)
//   does not support insertRule
speedy(false)

// we want react code by default :)
ReactSpecimen.defaultProps = {
  ...ReactSpecimen.defaultProps,
  showSource: true,
}

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}

require('glamor/reset')

const styleTag = document.createElement('style')
styleTag.innerHTML = fontFaces()
document.body.appendChild(styleTag)

const t = createFormatter(require('./lib/translations.json').data)

const darkModeSwitch = css({
  outline: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
})

const DarkModeSwitch = ({ setColorSchemeKey, colorSchemeKey }) => {
  const [colorScheme] = useColorContext()
  const otherColorSchemeKey = colorSchemeKey === 'light' ? 'dark' : 'light'
  return (
    <button
      {...darkModeSwitch}
      title={`Switch to ${otherColorSchemeKey} mode`}
      onClick={() => setColorSchemeKey(otherColorSchemeKey)}
    >
      <DarkmodeIcon {...colorScheme.set('fill', 'text')} />
    </button>
  )
}

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  credentials: 'include',
  cache: new InMemoryCache(),
})

const Styleguide = () => {
  const [colorSchemeKey, setColorSchemeKey] = useState('light')
  return (
    <ApolloProvider client={client}>
      <DiscussionContext.Provider
        value={createSampleDiscussionContextValue({ t })}
      >
        <ColorContextProvider root colorSchemeKey={colorSchemeKey}>
          <div className={`${colorSchemeKey}-mode`}>
            <div style={{ position: 'fixed', zIndex: 1, right: 10, top: 12 }}>
              <DarkModeSwitch
                colorSchemeKey={colorSchemeKey}
                setColorSchemeKey={setColorSchemeKey}
              />
            </div>
            <Catalog
              title='Style Guide'
              theme={theme[colorSchemeKey]}
              useBrowserHistory
              responsiveSizes={[
                { name: 'Mobile', width: 320, height: 480 },
                { name: 'Desktop small', width: 800, height: 600 },
                { name: 'Desktop large', width: 1095, height: 800 },
                { name: 'Desktop xlarge', width: 2560, height: 800 },
              ]}
              specimens={{
                'remove-react-source': () => {
                  // eslint-disable-next-line
                  React.useEffect(() => {
                    for (const el of document.querySelectorAll(
                      '[class$=-source-className',
                    )) {
                      el.remove()
                    }
                  }, [])
                  return null
                },
              }}
              pages={[
                {
                  path: '/',
                  title: 'Overview',
                  src: require('./README.md'),
                },
                {
                  title: 'Brand',
                  pages: [
                    {
                      path: '/logo',
                      title: 'Logo',
                      imports: {
                        Logo: require('./components/Logo'),
                        BrandMark: require('./components/Logo/BrandMark'),
                      },
                      src: require('./components/Logo/docs.md'),
                    },
                    {
                      path: '/typography',
                      title: 'Typography',
                      imports: {
                        ...require('./components/Typography'),
                        css,
                        styles: JSON.parse(JSON.stringify(fontStyles)),
                        fontFamilies: require('./theme/fonts').fontFamilies,
                      },
                      src: require('./components/Typography/docs.md'),
                    },
                    {
                      path: '/colors',
                      title: 'Colors',
                      component: require('./theme/colors.docs.js'),
                    },
                    {
                      path: '/icons',
                      title: 'Icons',
                      imports: {
                        css,
                        ...require('./components/Icons'),
                        ...require('./components/Typography'),
                        IconButton: require('./components/IconButton'),
                      },
                      src: require('./components/Icons/docs.md'),
                    },
                    {
                      path: '/share-image',
                      title: 'Share Image',
                      src: require('./components/ShareImage/docs.md'),
                      imports: {
                        ...require('./components/Typography'),
                        ShareImageGenerator: require('./components/ShareImage'),
                        ShareImagePreview: require('./components/ShareImage/ShareImagePreview'),
                        SharePreviewTwitter: require('./components/ShareImage/SharePreviewTwitter'),
                        SharePreviewFacebook: require('./components/ShareImage/SharePreviewFacebook'),
                      },
                    },
                    {
                      path: '/audio-cover',
                      title: 'Audio Cover',
                      src: require('./components/AudioCoverGenerator/docs.md'),
                      imports: {
                        AudioCoverGenerator: require('./components/AudioCoverGenerator'),
                      },
                    },
                  ],
                },
                {
                  title: 'Components',
                  pages: [
                    {
                      path: '/components/spinner',
                      title: 'Spinner',
                      imports: {
                        Spinner: require('./components/Spinner'),
                        InlineSpinner: require('./components/Spinner')
                          .InlineSpinner,
                      },
                      src: require('./components/Spinner/docs.md'),
                    },
                    {
                      path: '/components/container',
                      title: 'Container',
                      imports: require('./components/Grid'),
                      src: require('./components/Grid/docs.md'),
                    },
                    {
                      path: '/components/loader',
                      title: 'Loader',
                      imports: {
                        ...require('./components/Typography'),
                        Loader: require('./components/Loader'),
                        Spinner: require('./components/Spinner'),
                        NarrowContainer:
                          require('./components/Grid').NarrowContainer,
                      },
                      src: require('./components/Loader/docs.md'),
                    },
                    {
                      path: '/components/button',
                      title: 'Button',
                      imports: {
                        css,
                        merge,
                        Button: require('./components/Button'),
                        AudioIcon: require('./components/Icons').AudioIcon,
                        plainButtonRule: require('./components/Button')
                          .plainButtonRule,
                      },
                      src: require('./components/Button/docs.md'),
                    },
                    {
                      path: '/components/iconbutton',
                      title: 'IconButton',
                      imports: {
                        css,
                        BookmarkIcon:
                          require('./components/Icons').BookmarkIcon,
                        IconButton: require('./components/IconButton'),
                      },
                      src: require('./components/IconButton/docs.md'),
                    },
                    {
                      path: '/format',
                      title: 'FormatTag',
                      imports: {
                        ...require('./components/Format'),
                      },
                      src: require('./components/Format/docs.md'),
                    },
                    {
                      path: '/components/overlay',
                      title: 'Overlay',
                      imports: {
                        t,
                        ...require('./components/Overlay/docs.imports'),
                        Slider: require('./components/Form/Slider.tsx'),
                      },
                      src: require('./components/Overlay/docs.md'),
                    },
                    {
                      path: '/components/raw-html',
                      title: 'RawHtml',
                      imports: {
                        ...require('./components/Typography'),
                        RawHtml: require('./components/RawHtml'),
                      },
                      src: require('./components/RawHtml/docs.md'),
                    },
                    {
                      path: '/videoplayer',
                      title: 'VideoPlayer',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/VideoPlayer'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/VideoPlayer/docs.md'),
                    },
                    {
                      path: '/audioplayer',
                      title: 'AudioPlayer',
                      imports: {
                        t,
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/AudioPlayer'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/AudioPlayer/docs.md'),
                    },
                    {
                      path: '/lazyload',
                      title: 'LazyLoad',
                      imports: {
                        ...require('./components/Typography').Interaction,
                        LazyLoad: require('./components/LazyLoad'),
                        LazyImage: require('./components/LazyLoad/Image'),
                      },
                      src: require('./components/LazyLoad/docs.md'),
                    },
                    {
                      path: '/components/progress',
                      title: 'Progress',
                      imports: {
                        ...require('./components/Progress'),
                        colors: require('./theme/colors'),
                      },
                      src: require('./components/Progress/docs.md'),
                    },
                    {
                      path: '/collapsable',
                      title: 'Collapsable',
                      imports: {
                        t,
                        ...require('./components/Typography'),
                        ...require('./components/Collapsable'),
                      },
                      src: require('./components/Collapsable/docs.md'),
                    },
                    {
                      path: '/callout',
                      title: 'Callout',
                      imports: {
                        CalloutMenu: require('./components/Callout/CalloutMenu'),
                        NotificationIcon:
                          require('./components/Icons').NotificationIcon,
                      },
                      src: require('./components/Callout/docs.md'),
                    },
                    {
                      path: '/tabs',
                      title: 'Tabs',
                      imports: {
                        ...require('./components/Format'),
                        Scroller: require('./components/Tabs/Scroller'),
                        TabButton: require('./components/Tabs/TabButton'),
                        plainButtonRule: require('./components/Button')
                          .plainButtonRule,
                      },
                      src: require('./components/Tabs/docs.md'),
                    },
                    {
                      path: '/expandablelink',
                      title: 'Expandable Link',
                      imports: {
                        t,
                        ...require('./components/Typography'),
                        ...require('./components/ExpandableLink'),
                        ExpandableLinkCallout: require('./components/ExpandableLink/ExpandableLinkCallout'),
                      },
                      src: require('./components/ExpandableLink/docs.md'),
                    },
                  ],
                },
                {
                  title: 'Forms',
                  pages: [
                    {
                      path: '/forms',
                      title: 'Fields',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Button: require('./components/Button'),
                        Checkbox: require('./components/Form/Checkbox.tsx'),
                        Radio: require('./components/Form/Radio.tsx'),
                        Field: require('./components/Form/Field'),
                        ...require('./components/Form/Field.docs.js'),
                        FieldSet: require('./components/Form/FieldSet.js'),
                        MaskedInput: require('react-maskedinput'),
                        AutosizeInput: require('react-textarea-autosize'),
                        SearchIcon: require('./components/Icons').SearchIcon,
                      },
                      src: require('./components/Form/docs.md'),
                    },
                    {
                      path: '/forms/radio',
                      title: 'Radio',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Radio: require('./components/Form/Radio.tsx'),
                        GetColorScheme,
                      },
                      src: require('./components/Form/Radio.docs.md'),
                    },
                    {
                      path: '/forms/checkbox',
                      title: 'Checkbox',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Checkbox: require('./components/Form/Checkbox.tsx'),
                        GetColorScheme,
                      },
                      src: require('./components/Form/Checkbox.docs.md'),
                    },
                    {
                      path: '/forms/dropdown',
                      title: 'Dropdown',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Button: require('./components/Button'),
                        Field: require('./components/Form/Field'),
                        Dropdown: require('./components/Form/Dropdown'),
                        VirtualDropdown: require('./components/Form/VirtualDropdown'),
                        NativeDropdown: require('./components/Form/NativeDropdown'),
                        dropdownItems: [
                          { value: '1', text: 'Redaktorin' },
                          { value: '2', text: 'Fussballerin' },
                          { value: '3', text: 'Pizzaliebhaberin' },
                          {
                            value: '4',
                            text: 'Fussballspielende Redaktionspizzaliebhaberin',
                          },
                          {
                            value: '5',
                            text: 'Fussballspielende Redaktionspizzaliebhaberin Elementa',
                            element: (
                              <span>
                                <small>Fussballspielende</small>
                                <br />
                                Redaktionspizzaliebhaberin Elementa
                              </span>
                            ),
                          },
                        ],
                        VirtualDropdownInternal: {
                          Items: require('./components/Form/VirtualDropdown')
                            .Items,
                          ItemsContainer:
                            require('./components/Form/VirtualDropdown')
                              .ItemsContainer,
                          Inner: require('./components/Form/VirtualDropdown')
                            .Inner,
                        },
                      },
                      src: require('./components/Form/Dropdown.docs.md'),
                    },
                    {
                      path: '/forms/autocomplete',
                      title: 'Autocomplete',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Autocomplete: require('./components/Form/Autocomplete.js'),
                        SearchIcon: require('./components/Icons').SearchIcon,
                      },
                      src: require('./components/Form/Autocomplete.docs.md'),
                    },
                    {
                      path: '/forms/slider',
                      title: 'Slider',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Slider: require('./components/Form/Slider.tsx'),
                      },
                      src: require('./components/Form/Slider.docs.md'),
                    },
                  ],
                },
                {
                  title: 'Discussion',
                  pages: [
                    {
                      path: '/components/discussion',
                      title: 'Introduction',
                      src: require('./components/Discussion/docs.md'),
                    },
                    {
                      path: '/components/discussion/comment-teaser',
                      title: 'Comment Teaser',
                      imports: {
                        t,
                        ...require('./components/CommentTeaser/docs.imports'),
                      },
                      src: require('./components/CommentTeaser/docs.md'),
                    },
                    {
                      path: '/components/discussion/composer',
                      title: 'Composer',
                      imports: {
                        t,
                        ...require('./components/Discussion/Composer/docs.imports'),
                      },
                      src: require('./components/Discussion/Composer/docs.md'),
                    },
                    {
                      path: '/components/discussion/tree',
                      title: 'Tree',
                      imports: {
                        t,
                        ...require('./components/Discussion/Tree/docs.imports'),
                      },
                      src: require('./components/Discussion/Tree/docs.md'),
                    },
                    {
                      path: '/components/discussion/internal',
                      title: 'Internal',
                      imports: {
                        t,
                        createSampleDiscussionContextValue,
                        ...require('./components/Discussion/Internal/docs.imports'),
                      },
                      src: require('./components/Discussion/Internal/docs.md'),
                    },
                  ],
                },
                {
                  title: 'Article Elements',
                  pages: [
                    {
                      path: '/center',
                      title: 'Center',
                      imports: {
                        Center: require('./components/Center'),
                        Breakout: require('./components/Center').Breakout,
                      },
                      src: require('./components/Center/docs.md'),
                    },
                    {
                      path: '/titleblock',
                      title: 'TitleBlock',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        TitleBlock: require('./components/TitleBlock'),
                        TeaserFrontLogo: require('./components/TeaserFront/Logo'),
                      },
                      src: require('./components/TitleBlock/docs.md'),
                    },
                    {
                      path: '/blockquote',
                      title: 'BlockQuote',
                      imports: {
                        css,
                        ...require('./components/BlockQuote'),
                        ...require('./components/Typography'),
                        ...require('./components/Figure'),
                      },
                      src: require('./components/BlockQuote/docs.md'),
                    },
                    {
                      path: '/pullquote',
                      title: 'PullQuote',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/PullQuote'),
                        ...require('./components/Figure'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/PullQuote/docs.md'),
                    },
                    {
                      path: '/infobox',
                      title: 'InfoBox',
                      imports: {
                        t,
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/InfoBox'),
                        ...require('./components/Figure'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/InfoBox/docs.md'),
                    },
                    {
                      path: '/tweet',
                      title: 'Tweet',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        Tweet: require('./components/Social/Tweet'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/Social/docs.md'),
                    },
                    {
                      path: '/video',
                      title: 'Video',
                      imports: {
                        t,
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/Video'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/Video/docs.md'),
                    },
                    {
                      path: '/figure',
                      title: 'Figure',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/Figure'),
                        Center: require('./components/Center'),
                        Fragment,
                        ColorContextProvider,
                      },
                      src: require('./components/Figure/docs.md'),
                    },
                    {
                      path: '/list',
                      title: 'List',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/List'),
                        Center: require('./components/Center'),
                      },
                      src: require('./components/List/docs.md'),
                    },
                    {
                      path: '/dossier',
                      title: 'Dossier',
                      imports: {
                        css,
                        t,
                        ...require('./components/Typography'),
                        ...require('./components/Dossier'),
                        ...require('./components/TeaserFront'),
                        ...require('./components/Figure'),
                      },
                      src: require('./components/Dossier/docs.md'),
                    },
                    {
                      path: '/illustration-html',
                      title: 'IllustrationHtml',
                      imports: {
                        IllustrationHtml: require('./components/IllustrationHtml'),
                      },
                      src: require('./components/IllustrationHtml/docs.md'),
                    },
                    {
                      path: '/dynamic-component',
                      title: 'DynamicComponent',
                      imports: {
                        DynamicComponent: require('./components/DynamicComponent'),
                      },
                      src: require('./components/DynamicComponent/docs.md'),
                    },
                  ],
                },
                {
                  title: 'Teasers',
                  pages: [
                    {
                      path: '/teaserfeed',
                      title: 'Feed',
                      imports: {
                        css,
                        t,
                        ...require('./components/Typography'),
                        ...require('./components/TeaserFeed'),
                        AudioIcon: require('./components/Icons').AudioIcon,
                        BookmarkIcon:
                          require('./components/Icons').BookmarkIcon,
                        Center: require('./components/Center'),
                      },
                      src: require('./components/TeaserFeed/docs.md'),
                    },
                    {
                      path: '/teaserfrontimage',
                      title: 'FrontImage',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/TeaserFront'),
                        Image: require('./components/Figure/Image'),
                      },
                      src: require('./components/TeaserFront/Image.md'),
                    },
                    {
                      path: '/teaserfronttypo',
                      title: 'FrontTypo',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/TeaserFront'),
                      },
                      src: require('./components/TeaserFront/Typo.md'),
                    },
                    {
                      path: '/teaserfrontsplit',
                      title: 'FrontSplit',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/TeaserFront'),
                        Image: require('./components/Figure/Image'),
                      },
                      src: require('./components/TeaserFront/Split.md'),
                    },
                    {
                      path: '/teaserfronttile',
                      title: 'FrontTile',
                      imports: {
                        css,
                        ...require('./components/Typography'),
                        ...require('./components/TeaserFront'),
                        Image: require('./components/Figure/Image'),
                      },
                      src: require('./components/TeaserFront/Tile.md'),
                    },
                    {
                      path: '/teaserfrontdossier',
                      title: 'FrontDossier',
                      imports: {
                        css,
                        t,
                        ...require('./components/Typography'),
                        ...require('./components/Dossier'),
                        ...require('./components/TeaserFront'),
                        ...require('./components/Figure'),
                      },
                      src: require('./components/Dossier/Teaser.md'),
                    },
                    {
                      path: '/teaseractivedebates',
                      title: 'TeaserActiveDebates',
                      imports: {
                        css,
                        t,
                        ...require('./components/TeaserActiveDebates'),
                        ...require('./components/TeaserActiveDebates/__docs__'),
                        ...require('./components/Discussion/Internal/Comment'),
                        ...require('./components/TeaserShared'),
                        ...require('./components/Typography'),
                      },
                      src: require('./components/TeaserActiveDebates/docs.md'),
                    },
                    {
                      path: '/teasermymagazine',
                      title: 'TeaserMyMagazine',
                      imports: {
                        css,
                        ...require('./components/TeaserMyMagazine'),
                        ...require('./components/TeaserMyMagazine/__docs__'),
                        ...require('./components/TeaserFeed'),
                        ...require('./components/Progress'),
                        BookmarkIcon:
                          require('./components/Icons').BookmarkIcon,
                        IconButton: require('./components/IconButton'),
                      },
                      src: require('./components/TeaserMyMagazine/docs.md'),
                    },
                    {
                      path: '/teaserflyer',
                      title: 'TeaserFlyer',
                      imports: {
                        css,
                        ...require('./components/TeaserFlyer'),
                      },
                      src: require('./components/TeaserFlyer/docs.md'),
                    },
                    {
                      path: '/teasercarousel',
                      title: 'TeaserCarousel',
                      imports: {
                        ColorContextProvider,
                        css,
                        t,
                        ...require('./components/TeaserCarousel'),
                        ...require('./components/TeaserShared'),
                        ...require('./components/TeaserFront'),
                        ...require('./components/Typography'),

                        // ...require("./components/Figure")
                      },
                      src: require('./components/TeaserCarousel/docs.md'),
                    },
                    {
                      path: '/seriesnav',
                      title: 'SeriesNav',
                      imports: {
                        ColorContextProvider,
                        css,
                        t,
                        ...require('./components/TeaserCarousel'),
                        ...require('./components/SeriesNav'),
                        ...require('./components/SeriesNav/__docs__'),
                        ...require('./components/Typography'),
                        ...require('./components/Progress'),
                        ...require('./components/Icons'),
                        IconButton: require('./components/IconButton'),
                      },
                      src: require('./components/SeriesNav/docs.md'),
                    },
                    {
                      path: '/teasershared',
                      title: 'Shared',
                      imports: {
                        css,
                        ...require('./components/TeaserShared'),
                      },
                      src: require('./components/TeaserShared/docs.md'),
                    },
                  ],
                },
                {
                  title: 'Templates',
                  pages: [
                    {
                      path: '/templates/article',
                      title: 'Article',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Article').default({
                            t,
                            PayNote: require('./components/SeriesNav/__docs__')
                              .TestPayNote,
                          }),
                        customSchema: (options) =>
                          require('../../mdast-templates/src/Article').default({
                            t,
                            PayNote: require('./components/SeriesNav/__docs__')
                              .TestPayNote,
                            ...options,
                          }),
                        ...require('./components/SeriesNav/__docs__'),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Article/docs.md'),
                    },
                    {
                      path: '/templates/article-email',
                      title: 'Article Email',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Article/email')
                            .default,
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                        fixtures: {
                          ...require('../../mdast-templates/src/Article/test/article.stub'),
                        },
                      },
                      src: require('./templates/Article/email/docs.md'),
                    },
                    {
                      path: '/templates/discussion',
                      title: 'Discussion',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Discussion').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Discussion/docs.md'),
                    },
                    {
                      path: '/templates/comment',
                      title: 'Comment',
                      imports: {
                        webSchema:
                          require('../../mdast-templates/src/Comment/web').default(),
                        emailSchema:
                          require('../../mdast-templates/src/Comment/email').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Comment/docs.md'),
                    },
                    {
                      path: '/templates/section',
                      title: 'Section',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Section').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Section/docs.md'),
                    },
                    {
                      path: '/templates/format',
                      title: 'Format',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Format').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Format/docs.md'),
                    },
                    {
                      path: '/templates/dossier',
                      title: 'Dossier',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Dossier').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Dossier/docs.md'),
                    },
                    {
                      path: '/templates/front',
                      title: 'Front',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Front').default({
                            t,
                          }),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Front/docs.md'),
                    },
                    {
                      path: '/templates/editorialnewsletter',
                      title: 'Newsletter',
                      imports: {
                        VariableContext: require('./components/Variables')
                          .VariableContext,
                        webSchema:
                          require('../../mdast-templates/src/EditorialNewsletter/web').default(),
                        createEmailSchema:
                          require('../../mdast-templates/src/EditorialNewsletter/email')
                            .default,
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/EditorialNewsletter/docs.md'),
                    },
                    {
                      path: '/templates/page',
                      title: 'Page',
                      imports: {
                        schema:
                          require('../../mdast-templates/src/Page').default(),
                        ...require('../../mdast-templates/src/docs'),
                        renderMdast: require('mdast-react-render').renderMdast,
                      },
                      src: require('./templates/Page/docs.md'),
                    },
                  ],
                },
                {
                  title: 'Charts',
                  pages: [
                    {
                      path: '/charts',
                      title: 'Overview',
                      component: require('./components/Chart/docs.js').default,
                    },
                    {
                      path: '/charts/editor',
                      title: 'Editor',
                      imports: {
                        ...require('./components/Typography'),
                        ChartEditor: require('./components/Chart/Editor'),
                        data: {
                          ...require('./components/Chart/Editor/docs.data'),
                        },
                        Scroller: require('./components/Tabs/Scroller'),
                        TabButton: require('./components/Tabs/TabButton'),
                        ErrorBoundary: require('./components/ErrorBoundary'),
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Editor/docs.md'),
                    },
                    {
                      path: '/charts/bars',
                      title: 'Bars',
                      imports: {
                        ...require('./components/Typography'),
                        ColorContextProvider,
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Bars.docs.md'),
                    },
                    {
                      path: '/charts/timebars',
                      title: 'Time Bars',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/TimeBars.docs.md'),
                    },
                    {
                      path: '/charts/lollipops',
                      title: 'Lollipops',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Lollipops.docs.md'),
                    },
                    {
                      path: '/charts/lines',
                      title: 'Lines',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Lines.docs.md'),
                    },
                    {
                      path: '/charts/slopes',
                      title: 'Slopes',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Slopes.docs.md'),
                    },
                    {
                      path: '/charts/scatterplots',
                      title: 'Scatter Plots',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/ScatterPlots.docs.md'),
                    },
                    {
                      path: '/charts/maps',
                      title: 'Maps',
                      imports: {
                        ...require('./components/Typography'),
                        data: {
                          ...require('./components/Chart/Maps.docs.data'),
                        },
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Maps.docs.md'),
                    },
                    {
                      path: '/charts/maps/data',
                      title: 'Maps Data',
                      src: require('./components/Chart/Maps.data.docs.md'),
                    },
                    {
                      path: '/charts/hemicycle',
                      title: 'Hemicycle',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Hemicycle.docs.md'),
                    },
                    {
                      path: '/charts/table',
                      title: 'Table',
                      imports: {
                        ...require('./components/Typography'),
                        ChartTitle: require('./components/Chart').ChartTitle,
                        ChartLead: require('./components/Chart').ChartLead,
                        ChartLegend: require('./components/Chart').ChartLegend,
                        CsvChart: require('./components/Chart/Csv'),
                        t,
                      },
                      src: require('./components/Chart/Table.docs.md'),
                    },
                  ],
                },
                {
                  title: 'Editor',
                  pages: [
                    {
                      path: '/editor',
                      title: 'Docs',
                      src: require('./components/Editor/__docs__/index.md'),
                    },
                    {
                      path: '/editor/flyer',
                      title: 'Flyer',
                      imports: {
                        ...require('./components/Editor/__docs__/flyer.imports'),
                        schema: require('./components/Editor/schema/flyer'),
                        editorSchema: require('./components/Editor/schema/flyerEditor'),
                        Editor: require('./components/Editor/DevEditor'),
                        SlateRender: require('./components/Editor/Render'),
                        renderAsText: require('./components/Editor/Render/text'),
                        t,
                      },
                      src: require('./components/Editor/__docs__/flyer.md'),
                    },
                  ],
                },
                {
                  title: 'Development',
                  pages: [
                    {
                      path: '/dev/process',
                      title: 'Process',
                      src: require('./development/process.docs.md'),
                    },
                    {
                      path: '/dev/translate',
                      title: 'Translate',
                      src: require('./lib/translate.docs.md'),
                      imports: {
                        Field: require('./components/Form/Field'),
                        ...require('./components/Typography'),
                        t: createFormatter([
                          {
                            key: 'styleguide/Hello/generic',
                            value: 'Hallo!',
                          },
                          {
                            key: 'styleguide/Hello/greetings',
                            value: 'Hallo {name}',
                          },
                          {
                            key: 'styleguide/Hello/greetings/Thomas',
                            value: 'Hoi Thomas',
                          },
                          {
                            key: 'styleguide/Hello/message/0',
                            value: 'Sie waren noch nie hier',
                          },
                          {
                            key: 'styleguide/Hello/message/1',
                            value: 'Willkommen an Bord {name}!',
                          },
                          {
                            key: 'styleguide/Hello/message/2',
                            value: 'Schön Sie wieder zu sehen!',
                          },
                          {
                            key: 'styleguide/Hello/message/other',
                            value: 'Willkommen zum {count}. Mal {name}!',
                          },
                          {
                            key: 'styleguide/Hello/label/visits',
                            value: 'Anzahl Besuche',
                          },
                          {
                            key: 'styleguide/Hello/label/name',
                            value: 'Name',
                          },
                          {
                            key: 'styleguide/Hello/html',
                            value: 'Hallo<br />{link}',
                          },
                        ]),
                        RawHtml: require('./components/RawHtml'),
                      },
                    },
                    {
                      path: '/dev/slug',
                      title: 'Slug',
                      src: require('./lib/slug.docs.md'),
                    },
                    {
                      path: '/z-index',
                      title: 'z-index',
                      src: require('./theme/zIndex.docs.md'),
                    },
                    {
                      path: '/dev/inQuotes',
                      title: 'inQuotes',
                      src: require('./lib/inQuotes.docs.md'),
                      imports: {
                        ...require('./components/Typography'),
                        ...require('./lib/inQuotes'),
                      },
                    },
                    {
                      path: '/dev/useHeaderHeight',
                      title: 'useHeaderHeight',
                      src: require('./lib/useHeaderHeight.docs.md'),
                      imports: {
                        ...require('./lib/useHeaderHeight'),
                        css,
                      },
                    },
                    {
                      path: '/dev/colors',
                      title: 'ColorContext',
                      src: require('./components/Colors/docs.md'),
                      imports: {
                        Container:
                          require('../../mdast-templates/src/Article/Container')
                            .default,
                        ...require('./components/Typography'),
                        ColorContextProvider,
                        ColorContextLocalExtension:
                          require('./components/Colors/ColorContext')
                            .ColorContextLocalExtension,
                        useColorContext,
                        GetColorScheme,
                        css,
                      },
                    },
                    {
                      path: '/dev/typescript',
                      title: 'Typescript',
                      src: require('./development/typescript.docs.md'),
                    },
                  ],
                },
              ]}
            />
          </div>
        </ColorContextProvider>
      </DiscussionContext.Provider>
    </ApolloProvider>
  )
}

ReactDOM.render(<Styleguide />, document.getElementById('root'))
