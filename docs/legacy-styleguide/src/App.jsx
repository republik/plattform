import { css, flush, merge, simulations, speedy } from 'glamor'
// simulations(true)
// // prevent speedy in catalog
// // - iframe rendering (e.g. responsive preview)
// //   does not support insertRule
// flush()
// speedy(false)

import { Catalog } from '@catalog/core'

import { createFormatter, useColorContext } from '@project-r/styleguide'

import * as SG from '@project-r/styleguide'

const docs = import.meta.glob('../../../packages/styleguide/**/*.md', {
  eager: true,
  query: 'url',
  import: 'default',
})

// const docsJs = import.meta.glob('../../../packages/styleguide/**/*.docs.js', {
//   eager: true,
//   import: 'default',
// })

const docSrc = (src) => {
  const key = `../../../packages/styleguide/src/${src.replace(/^\.\//, '')}`
  const key2 = `../../../packages/styleguide/${src.replace(/^\.\//, '')}`
  return docs[key] ?? docs[key2]
}

const GetColorScheme = ({ children }) => {
  const [colorScheme] = useColorContext()

  return children(colorScheme)
}

import translations from '../../../packages/styleguide/src/lib/translations.json'

const t = createFormatter(translations.data)

function App() {
  return (
    <>
      <Catalog
        basePath='/legacy-styleguide'
        title='Style Guide'
        // theme={theme[colorSchemeKey]}
        useBrowserHistory
        responsiveSizes={[
          { name: 'Mobile', width: 320, height: 480 },
          { name: 'Desktop small', width: 800, height: 600 },
          { name: 'Desktop large', width: 1095, height: 800 },
          { name: 'Desktop xlarge', width: 2560, height: 800 },
        ]}
        imports={{
          css,
          t,
          ...SG,
        }}
        pages={[
          {
            path: '/',
            title: 'Overview',
            src: docSrc('./README.md'),
          },
          {
            title: 'Brand',
            pages: [
              {
                path: '/logo',
                title: 'Logo',
                src: docSrc('./components/Logo/docs.md'),
              },
              /*    {
                path: '/typography',
                title: 'Typography',
                imports: {
                  ...Typography,
                  css,
                  styles: JSON.parse(JSON.stringify(fontStyles)),
                  // fontFamilies: require('./theme/fonts').fontFamilies,
                },
                src: docSrc('./components/Typography/docs.md'),
              },
             {
                path: '/colors',
                title: 'Colors',
                component: docSrc('./theme/colors.docs.js'),
              } 
              {
                path: '/icons',
                title: 'Icons',
                imports: {
                  css,
                  ...require('./components/Icons'),
                  ...require('./components/Typography'),
                  IconButton: require('./components/IconButton'),
                },
                src: docSrc('./components/Icons/docs.md'),
              },
              {
                path: '/share-image',
                title: 'Share Image',
                src: docSrc('./components/ShareImage/docs.md'),
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
                src: docSrc('./components/AudioCoverGenerator/docs.md'),
                imports: {
                  AudioCoverGenerator: require('./components/AudioCoverGenerator'),
                },
              },*/
            ],
          } /*
          {
            title: 'Components',
            pages: [
              {
                path: '/components/spinner',
                title: 'Spinner',
                imports: SG,
                src: docSrc('./components/Spinner/docs.md'),
              },
              {
                path: '/components/container',
                title: 'Container',
                imports: SG,
                src: docSrc('./components/Grid/docs.md'),
              },
              {
                path: '/components/loader',
                title: 'Loader',
                imports: SG,
                src: docSrc('./components/Loader/docs.md'),
              },
              {
                path: '/components/button',
                title: 'Button',
                imports: {
                  css,
                  merge,
                  ...SG,
                },
                src: docSrc('./components/Button/docs.md'),
              },
              {
                path: '/components/iconbutton',
                title: 'IconButton',
                imports: {
                  css,
                  ...SG,
                },
                src: docSrc('./components/IconButton/docs.md'),
              },
              {
                path: '/format',
                title: 'FormatTag',
                imports: SG,
                src: docSrc('./components/Format/docs.md'),
              },
              {
                path: '/components/overlay',
                title: 'Overlay',
                imports: {
                  t,
                  ...SG,
                },
                src: docSrc('./components/Overlay/docs.md'),
              },
              {
                path: '/components/raw-html',
                title: 'RawHtml',

                src: docSrc('./components/RawHtml/docs.md'),
              },
              {
                path: '/videoplayer',
                title: 'VideoPlayer',

                src: docSrc('./components/VideoPlayer/docs.md'),
              },
              {
                path: '/audioplayer',
                title: 'AudioPlayer',

                src: docSrc('./components/AudioPlayer/docs.md'),
              },
              {
                path: '/lazyload',
                title: 'LazyLoad',

                src: docSrc('./components/LazyLoad/docs.md'),
              },
              {
                path: '/components/progress',
                title: 'Progress',

                src: docSrc('./components/Progress/docs.md'),
              },
              {
                path: '/collapsable',
                title: 'Collapsable',

                src: docSrc('./components/Collapsable/docs.md'),
              },
              {
                path: '/callout',
                title: 'Callout',

                src: docSrc('./components/Callout/docs.md'),
              },
              {
                path: '/tabs',
                title: 'Tabs',

                src: docSrc('./components/Tabs/docs.md'),
              },
              {
                path: '/expandablelink',
                title: 'Expandable Link',

                src: docSrc('./components/ExpandableLink/docs.md'),
              },
            ],
          },
          {
            title: 'Forms',
            pages: [
              {
                path: '/forms',
                title: 'Fields',

                src: docSrc('./components/Form/docs.md'),
              },
              {
                path: '/forms/radio',
                title: 'Radio',

                src: docSrc('./components/Form/Radio.docs.md'),
              },
              {
                path: '/forms/checkbox',
                title: 'Checkbox',

                src: docSrc('./components/Form/Checkbox.docs.md'),
              },
              {
                path: '/forms/dropdown',
                title: 'Dropdown',
                imports: {
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
                },
                src: docSrc('./components/Form/Dropdown.docs.md'),
              },
              {
                path: '/forms/autocomplete',
                title: 'Autocomplete',

                src: docSrc('./components/Form/Autocomplete.docs.md'),
              },
              {
                path: '/forms/slider',
                title: 'Slider',

                src: docSrc('./components/Form/Slider.docs.md'),
              },
            ],
          },
          {
            title: 'Discussion',
            pages: [
              {
                path: '/components/discussion',
                title: 'Introduction',
                src: docSrc('./components/Discussion/docs.md'),
              },
              {
                path: '/components/discussion/comment-teaser',
                title: 'Comment Teaser',

                src: docSrc('./components/CommentTeaser/docs.md'),
              },
              {
                path: '/components/discussion/composer',
                title: 'Composer',

                src: docSrc('./components/Discussion/Composer/docs.md'),
              },
              {
                path: '/components/discussion/tree',
                title: 'Tree',

                src: docSrc('./components/Discussion/Tree/docs.md'),
              },
              {
                path: '/components/discussion/internal',
                title: 'Internal',

                src: docSrc('./components/Discussion/Internal/docs.md'),
              },
            ],
          } /*
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
                src: docSrc('./components/Center/docs.md'),
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
                src: docSrc('./components/TitleBlock/docs.md'),
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
                src: docSrc('./components/BlockQuote/docs.md'),
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
                src: docSrc('./components/PullQuote/docs.md'),
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
                src: docSrc('./components/InfoBox/docs.md'),
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
                src: docSrc('./components/Social/docs.md'),
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
                src: docSrc('./components/Video/docs.md'),
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
                src: docSrc('./components/Figure/docs.md'),
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
                src: docSrc('./components/List/docs.md'),
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
                src: docSrc('./components/Dossier/docs.md'),
              },
              {
                path: '/illustration-html',
                title: 'IllustrationHtml',
                imports: {
                  IllustrationHtml: require('./components/IllustrationHtml'),
                },
                src: docSrc('./components/IllustrationHtml/docs.md'),
              },
              {
                path: '/dynamic-component',
                title: 'DynamicComponent',
                imports: {
                  DynamicComponent: require('./components/DynamicComponent'),
                },
                src: docSrc('./components/DynamicComponent/docs.md'),
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
                  BookmarkIcon: require('./components/Icons').BookmarkIcon,
                  Center: require('./components/Center'),
                },
                src: docSrc('./components/TeaserFeed/docs.md'),
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
                src: docSrc('./components/TeaserFront/Image.md'),
              },
              {
                path: '/teaserfronttypo',
                title: 'FrontTypo',
                imports: {
                  css,
                  ...require('./components/Typography'),
                  ...require('./components/TeaserFront'),
                },
                src: docSrc('./components/TeaserFront/Typo.md'),
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
                src: docSrc('./components/TeaserFront/Split.md'),
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
                src: docSrc('./components/TeaserFront/Tile.md'),
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
                src: docSrc('./components/Dossier/Teaser.md'),
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
                src: docSrc('./components/TeaserActiveDebates/docs.md'),
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
                  BookmarkIcon: require('./components/Icons').BookmarkIcon,
                  IconButton: require('./components/IconButton'),
                },
                src: docSrc('./components/TeaserMyMagazine/docs.md'),
              },
              {
                path: '/separatorgutentag',
                title: '"Guten Tag" separator',
                imports: {
                  css,
                  ...require('./components/SeparatorGutenTag'),
                },
                src: docSrc('./components/SeparatorGutenTag/docs.md'),
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
                src: docSrc('./components/TeaserCarousel/docs.md'),
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
                src: docSrc('./components/SeriesNav/docs.md'),
              },
              {
                path: '/teasershared',
                title: 'Shared',
                imports: {
                  css,
                  ...require('./components/TeaserShared'),
                },
                src: docSrc('./components/TeaserShared/docs.md'),
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
                  schema: require('./templates/Article').default({
                    t,
                    PayNote: require('./components/SeriesNav/__docs__')
                      .TestPayNote,
                  }),
                  customSchema: (options) =>
                    require('./templates/Article').default({
                      t,
                      PayNote: require('./components/SeriesNav/__docs__')
                        .TestPayNote,
                      ...options,
                    }),
                  ...require('./components/SeriesNav/__docs__'),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Article/docs.md'),
              },
              {
                path: '/templates/article-email',
                title: 'Article Email',
                imports: {
                  schema: require('./templates/Article/email').default,
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                  fixtures: {
                    ...require('./templates/Article/test/article.stub'),
                  },
                },
                src: docSrc('./templates/Article/email/docs.md'),
              },
              {
                path: '/templates/discussion',
                title: 'Discussion',
                imports: {
                  schema: require('./templates/Discussion').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Discussion/docs.md'),
              },
              {
                path: '/templates/comment',
                title: 'Comment',
                imports: {
                  webSchema: require('./templates/Comment/web').default(),
                  emailSchema: require('./templates/Comment/email').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Comment/docs.md'),
              },
              {
                path: '/templates/section',
                title: 'Section',
                imports: {
                  schema: require('./templates/Section').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Section/docs.md'),
              },
              {
                path: '/templates/format',
                title: 'Format',
                imports: {
                  schema: require('./templates/Format').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Format/docs.md'),
              },
              {
                path: '/templates/dossier',
                title: 'Dossier',
                imports: {
                  schema: require('./templates/Dossier').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Dossier/docs.md'),
              },
              {
                path: '/templates/front',
                title: 'Front',
                imports: {
                  schema: require('./templates/Front').default({ t }),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Front/docs.md'),
              },
              {
                path: '/templates/editorialnewsletter',
                title: 'Newsletter',
                imports: {
                  VariableContext: require('./components/Variables')
                    .VariableContext,
                  webSchema:
                    require('./templates/EditorialNewsletter/web').default(),
                  createEmailSchema:
                    require('./templates/EditorialNewsletter/email').default,
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/EditorialNewsletter/docs.md'),
              },
              {
                path: '/templates/page',
                title: 'Page',
                imports: {
                  schema: require('./templates/Page').default(),
                  ...require('./templates/docs'),
                  renderMdast: require('mdast-react-render').renderMdast,
                },
                src: docSrc('./templates/Page/docs.md'),
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
                src: docSrc('./components/Chart/Editor/docs.md'),
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
                src: docSrc('./components/Chart/Bars.docs.md'),
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
                src: docSrc('./components/Chart/TimeBars.docs.md'),
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
                src: docSrc('./components/Chart/Lollipops.docs.md'),
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
                src: docSrc('./components/Chart/Lines.docs.md'),
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
                src: docSrc('./components/Chart/Slopes.docs.md'),
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
                src: docSrc('./components/Chart/ScatterPlots.docs.md'),
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
                src: docSrc('./components/Chart/Maps.docs.md'),
              },
              {
                path: '/charts/maps/data',
                title: 'Maps Data',
                src: docSrc('./components/Chart/Maps.data.docs.md'),
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
                src: docSrc('./components/Chart/Hemicycle.docs.md'),
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
                src: docSrc('./components/Chart/Table.docs.md'),
              },
            ],
          },
          {
            title: 'Editor',
            pages: [
              {
                path: '/editor',
                title: 'Docs',
                src: docSrc('./components/Editor/__docs__/index.md'),
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
                src: docSrc('./components/Editor/__docs__/flyer.md'),
              },
            ],
          },
          {
            title: 'Development',
            pages: [
              {
                path: '/dev/process',
                title: 'Process',
                src: docSrc('./development/process.docs.md'),
              },
              {
                path: '/dev/translate',
                title: 'Translate',
                src: docSrc('./lib/translate.docs.md'),
                imports: {
                  Field: require('./components/Form/Field'),
                  ...require('./components/Typography'),
                  // t: createFormatter([
                  //   {
                  //     key: 'styleguide/Hello/generic',
                  //     value: 'Hallo!',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/greetings',
                  //     value: 'Hallo {name}',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/greetings/Thomas',
                  //     value: 'Hoi Thomas',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/message/0',
                  //     value: 'Sie waren noch nie hier',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/message/1',
                  //     value: 'Willkommen an Bord {name}!',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/message/2',
                  //     value: 'Schön Sie wieder zu sehen!',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/message/other',
                  //     value: 'Willkommen zum {count}. Mal {name}!',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/label/visits',
                  //     value: 'Anzahl Besuche',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/label/name',
                  //     value: 'Name',
                  //   },
                  //   {
                  //     key: 'styleguide/Hello/html',
                  //     value: 'Hallo<br />{link}',
                  //   },
                  // ]),
                  RawHtml: require('./components/RawHtml'),
                },
              },
              {
                path: '/dev/slug',
                title: 'Slug',
                src: docSrc('./lib/slug.docs.md'),
              },
              {
                path: '/z-index',
                title: 'z-index',
                src: docSrc('./theme/zIndex.docs.md'),
              },
              {
                path: '/dev/inQuotes',
                title: 'inQuotes',
                src: docSrc('./lib/inQuotes.docs.md'),
                imports: {
                  ...require('./components/Typography'),
                  ...require('./lib/inQuotes'),
                },
              },
              {
                path: '/dev/useHeaderHeight',
                title: 'useHeaderHeight',
                src: docSrc('./lib/useHeaderHeight.docs.md'),
                imports: {
                  ...require('./lib/useHeaderHeight'),
                  css,
                },
              },
              {
                path: '/dev/colors',
                title: 'ColorContext',
                src: docSrc('./components/Colors/docs.md'),
                imports: {
                  Container: require('./templates/Article/Container').default,
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
                src: docSrc('./development/typescript.docs.md'),
              },
            ],
          },*/,
        ]}
      />
    </>
  )
}

export default App
