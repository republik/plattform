import { getJson } from './env'

// some defaults are precomputed colors from d3-scale-chromatic
/*
 sequential = [
  d3.interpolateBlues(1),
  d3.interpolateBlues(0.95),
  d3.interpolateBlues(0.9),
  d3.interpolateBlues(0.85),
  d3.interpolateBlues(0.8),
  d3.interpolateBlues(0.75),
  d3.interpolateBlues(0.7),
  d3.interpolateBlues(0.65),
  d3.interpolateBlues(0.6),
  d3.interpolateBlues(0.55),
  d3.interpolateBlues(0.5)
 ],
 sequential3 = [d3.interpolateBlues(1), d3.interpolateBlues(0.8), d3.interpolateBlues(0.6)],
 opposite3 = [d3.interpolateReds(1), d3.interpolateReds(0.8), d3.interpolateReds(0.6)],
 discrete = d3.schemeCategory10
 */

const discrete = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]

const colorsDeprecated = {
  primary: '#00508C',
  primaryBg: '#BFE1FF',
  containerBg: '#FFF',
  secondary: '#00335A',
  secondaryBg: '#D8EEFF',
  disabled: '#B8BDC1',
  text: '#191919',
  lightText: '#979797',
  fill: '#000',
  lightFill: '#E9E9E9',
  error: '#9E0041',
  divider: '#DBDCDD',
  online: '#00DC00',
  social: '#E9A733',
  editorial: '#00B4FF',
  meta: '#64966E',
  feuilleton: '#555555',
  scribble: '#ef4533',
  neutral: '#bbb',
  highlight: '#FFFFCC',
  sequential: [
    'rgb(8, 48, 107)',
    'rgb(8, 61, 126)',
    'rgb(10, 74, 144)',
    'rgb(15, 87, 159)',
    'rgb(24, 100, 170)',
    'rgb(34, 113, 180)',
    'rgb(47, 126, 188)',
    'rgb(60, 139, 195)',
    'rgb(75, 151, 201)',
    'rgb(91, 163, 207)',
    'rgb(109, 174, 213)',
  ],
  sequential3: ['rgb(8,48,107)', 'rgb(24,100,170)', 'rgb(75,151,201)'],
  opposite3: ['rgb(103,0,13)', 'rgb(187,21,26)', 'rgb(239,69,51)'],
  discrete,
  negative: {
    containerBg: '#111',
    primaryBg: '#191919',
    text: '#f0f0f0',
    lightText: '#828282',
    divider: '#5b5b5b',
    fill: '#FFF',
    lightFill: '#555',
    error: 'rgb(239,69,51)',
    disabled: '#242424',
  },
  ...getJson('COLORS'),
}

// ToDos
// - mv getJson('COLORS') to a var
// - deep merge into light and dark
// - create open source color scheme, mv brand values to env via internal handbook

const colors = {
  light: {
    logo: '#000000',
    default: '#FFFFFF',
    overlay: '#FFFFFF',
    hover: '#F6F8F7',
    alert: '#E4F5E1',
    error: colorsDeprecated.error,
    defaultInverted: '#191919',
    overlayInverted: '#1F1F1F',
    divider: '#DADDDC',
    dividerInverted: '#4C4D4C',
    primary: '#00AA00',
    primaryHover: '#008800',
    text: '#282828',
    textInverted: '#F0F0F0',
    textSoft: '#7D7D7D',
    textSoftInverted: '#A9A9A9',
    disabled: '#C0C0C0',
    accentColorBriefing: '#0A99B8',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#000000',
    accentColorAudio: '#000000',
    overlayShadow: '0 0 15px rgba(0,0,0,0.1)',
    fadeOutGradientDefault:
      'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    fadeOutGradientOverlay:
      'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
    displayLight: 'block',
    displayDark: 'none',
    sequential100: 'rgb(8, 48, 107)',
    sequential95: 'rgb(8, 61, 126)',
    sequential90: 'rgb(10, 74, 144)',
    sequential85: 'rgb(15, 87, 159)',
    sequential80: 'rgb(24, 100, 170)',
    sequential75: 'rgb(34, 113, 180)',
    sequential70: 'rgb(47, 126, 188)',
    sequential65: 'rgb(60, 139, 195)',
    sequential60: 'rgb(75, 151, 201)',
    sequential55: 'rgb(91, 163, 207)',
    sequential50: 'rgb(109, 174, 213)',
    opposite100: 'rgb(103,0,13)',
    opposite80: 'rgb(187,21,26)',
    opposite60: 'rgb(239,69,51)',
    neutral: '#bbb',
    discrete,
    chartsInverted: '#000000',
  },
  dark: {
    logo: '#FFFFFF',
    default: '#191919',
    overlay: '#1F1F1F',
    hover: '#292929',
    alert: '#144313',
    error: colorsDeprecated.error,
    defaultInverted: '#FFFFFF',
    overlayInverted: '#FFFFFF',
    divider: '#4C4D4C',
    dividerInverted: '#DADDDC',
    primary: '#00AA00',
    primaryHover: '#008800',
    text: '#F0F0F0',
    textInverted: '#282828',
    textSoft: '#A9A9A9',
    textSoftInverted: '#7D7D7D',
    disabled: '#656565',
    accentColorBriefing: '#0A99B8',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#FFFFFF',
    accentColorAudio: '#FFFFFF',
    overlayShadow: '0 0 15px rgba(0,0,0,0.3)',
    fadeOutGradientDefault:
      'linear-gradient(0deg, rgba(25,25,25,1) 0%, rgba(25,25,25,0) 100%)',
    fadeOutGradientOverlay:
      'linear-gradient(0deg, rgba(31,31,31,1) 0%, rgba(31,31,31,0) 100%)',
    displayLight: 'none',
    displayDark: 'block',
    sequential100: 'rgb(24, 100, 170)',
    sequential95: 'rgb(34, 113, 180)',
    sequential90: 'rgb(47, 126, 188)',
    sequential85: 'rgb(60, 139, 195)',
    sequential80: 'rgb(75, 151, 201)',
    sequential75: 'rgb(91, 163, 207)',
    sequential70: 'rgb(109, 174, 213)',
    sequential65: 'rgb(128, 185, 218)',
    sequential60: 'rgb(147, 195, 223)',
    sequential55: 'rgb(165, 204, 228)',
    sequential50: 'rgb(181, 212, 233)',
    opposite100: 'rgb(187,21,26)',
    opposite80: 'rgb(239,69,51)',
    opposite60: 'rgb(252, 138, 107)',
    neutral: '#bbb',
    discrete,
    chartsInverted: '#FFFFFF',
  },
  mappings: {
    format: {
      '#000': 'accentColorMeta',
      '#000000': 'accentColorMeta',
      '#282828': 'accentColorMeta',
      '#07809A': 'accentColorBriefing',
      '#07809a': 'accentColorBriefing',
    },
    charts: {
      '#000': 'chartsInverted',
      '#000000': 'chartsInverted',
    },
  },
}

export const localInvertedColors = {
  light: colors.dark,
  dark: colors.light,
}

// add all deprecated colors, but only if they don't exist in new colors (no overwrites)
Object.keys(colorsDeprecated).forEach((key) => {
  if (!colors[key]) {
    colors[key] = colorsDeprecated[key]
  }
})

export default colors
