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
  overlayShadow: '0 0 15px rgba(0,0,0,0.1)',
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
    'rgb(109, 174, 213)'
  ],
  sequential3: ['rgb(8,48,107)', 'rgb(24,100,170)', 'rgb(75,151,201)'],
  opposite3: ['rgb(103,0,13)', 'rgb(187,21,26)', 'rgb(239,69,51)'],
  discrete: [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf'
  ],
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
    overlayShadow: '0 0 15px rgba(0,0,0,0.5)'
  },
  ...getJson('COLORS')
}

const colors = {
  bright: {
    logo: '#000000',
    default: '#FFFFFF',
    overlay: '#FFFFFF',
    hover: '#F6F8F7',
    alert: '#E4F5E1',
    defaultInverted: '#111111',
    overlayInverted: '#191919',
    divider: '#DADDDC',
    text: '#282828',
    textInverted: '#F0F0F0',
    textSoft: '#7D7D7D',
    textSoftInverted: '#A9A9A9',
    accentColorBriefing: '#07809A',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#000000',
    accentColorAudio: '#000000',
    overlayShadow: '0 0 15px rgba(0,0,0,0.1)'
  },
  dark: {
    logo: '#FFFFFF',
    default: '#1F1F1F',
    overlay: '#232323',
    hover: '#2F2F2F',
    alert: '#0E2B0D',
    defaultInverted: '#FFFFFF',
    overlayInverted: '#FFFFFF',
    divider: '#4C4D4C',
    text: '#F0F0F0',
    textInverted: '#282828',
    textSoft: '#A9A9A9',
    textSoftInverted: '#7D7D7D',
    accentColorBriefing: '#07809A',
    accentColorInteraction: '#00AA00',
    accentColorOppinion: '#D0913C',
    accentColorFormats: '#d44438',
    accentColorMeta: '#FFFFFF',
    accentColorAudio: '#FFFFFF',
    overlayShadow: '0 0 15px rgba(0,0,0,0.5)'
  },
  formatColorMap: {
    '#000': 'accentColorMeta',
    '#000000': 'accentColorMeta',
    '#282828': 'accentColorMeta'
  },
  static: {
    primary: '#00AA00',
    error: '#9f2500',
    textBright: '#F0F0F0',
    textBrightSoft: '#828282',
    textDark: '#282828',
    textDarkSoft: '#979797'
  }
}

// identify all variable color keys
export const variableColorKeys = Object.keys(colors.bright).filter(
  color => colors.bright[color] !== colors.dark[color]
)

//add all deprecated colors, but only if they don't exist in new colors (no overwrites)
Object.keys(colorsDeprecated).forEach(key => {
  if (!colors[key]) {
    colors[key] = colorsDeprecated[key]
  }
})

export default colors
