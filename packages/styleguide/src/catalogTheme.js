import { fontFamilies } from './theme/fonts'

const LIGHT_CHECKBOARD =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAF0lEQVQI12P4BAI/QICBFCaYBPNJYQIAkUZftTbC4sIAAAAASUVORK5CYII='
const DARK_CHECKBOARD =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAAAAACoWZBhAAAAFklEQVQI12NQBQF2EGAghQkmwXxSmADZJQiZ2ZZ46gAAAABJRU5ErkJggg=='

const fontStyles = {
  fontFamily: fontFamilies.sansSerifRegular,
  fontHeading: fontFamilies.sansSerifMedium,
  fontMono: fontFamilies.monospaceRegular,
  baseFontSize: 18,
}

export default {
  light: {
    background: '#F6F8F7',
    textColor: '#282828',
    codeColor: '#282828',
    linkColor: '#00AA00',

    // NavigationBar background color, but also sometimes used as a foreground
    // or border color.
    lightColor: '#DADDDC',

    // Used in PageHeader
    pageHeadingBackground: '#F6F8F7',
    pageHeadingTextColor: '#282828',

    // Used for navigation bar
    navBarBackground: '#F6F8F7',
    navBarTextColor: '#282828',

    // Used in ResponsiveTabs (tab text), Download specimen (title text).
    // Typography: headings.
    brandColor: '#282828',

    sidebarColor: '#F6F8F7',
    sidebarColorText: '#282828',
    sidebarColorTextActive: '#008800',
    sidebarColorLine: '#DADDDC',
    sidebarColorHeading: '#282828',

    // Used in the html, react, and image specimens.
    bgLight: '#FFFFFF',
    bgDark: '#191919',

    // Keys appear to be PrismJS token types.
    codeStyles: {
      tag: { color: 'rgb(239,69,51)' },
      punctuation: { color: '#7D7D7D' },
      script: { color: 'rgb(8, 48, 107)' },
      function: { color: 'rgb(187,21,26)' },
      keyword: { color: 'rgb(24, 100, 170)' },
      string: { color: 'rgb(75, 151, 201)' },
    },

    checkerboardPatternLight: LIGHT_CHECKBOARD,
    checkerboardPatternDark: DARK_CHECKBOARD,

    ...fontStyles,
  },
  dark: {
    background: '#292929',
    textColor: '#F0F0F0',
    codeColor: '#F0F0F0',
    linkColor: '#00AA00',

    // NavigationBar background color, but also sometimes used as a foreground
    // or border color.
    lightColor: '#4C4D4C',

    // Used in PageHeader
    pageHeadingBackground: '#292929',
    pageHeadingTextColor: '#F0F0F0',

    // Used for navigation bar
    navBarBackground: '#292929',
    navBarTextColor: '#F0F0F0',

    // Used in ResponsiveTabs (tab text), Download specimen (title text).
    // Typography: headings.
    brandColor: '#F0F0F0',

    sidebarColor: '#292929',
    sidebarColorText: '#F0F0F0',
    sidebarColorTextActive: '#008800',
    sidebarColorLine: '#4C4D4C',
    sidebarColorHeading: '#F0F0F0',

    // Used in the html, react, and image specimens.
    bgLight: '#191919',
    bgDark: '#FFFFFF',

    // Keys appear to be PrismJS token types.
    codeStyles: {
      tag: { color: 'rgb(252, 138, 107)' },
      punctuation: { color: '#A9A9A9' },
      script: { color: 'rgb(24, 100, 170)' },
      function: { color: 'rgb(239,69,51)' },
      keyword: { color: 'rgb(75, 151, 201)' },
      string: { color: 'rgb(147, 195, 223)' },
    },

    checkerboardPatternDark: LIGHT_CHECKBOARD,
    checkerboardPatternLight: DARK_CHECKBOARD,

    ...fontStyles,
  },
}
