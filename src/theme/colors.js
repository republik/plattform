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
    formatColorMap: {
      '#000': '#fff',
      '#000000': '#fff',
      '#282828': '#fff'
    }
  },
  ...getJson('COLORS')
}

const colors = {
  default: '#ffffff',
  overlay: '#ffffff',
  hover: '#f6f8f7',
  alert: '#ebf6e5',
  defaultInverted: '#111111',
  overlayInverted: '#191919',
  divider: '#dadddc',
  text: '#282828',
  textSoft: '#979797',
  textInverted: '#f0f0f0',
  textInvertedSoft: '#828282',
  static: {
    primary: '#3cad00',
    primaryDark: '#009400',
    secondary: '#4b6359',
    error: '#9f2500',
    textBright: '#f0f0f0',
    textBrightSoft: '#828282',
    textDark: '#282828',
    textDarkSoft: '#979797'
  },
  accentColors: {
    accent1: '#07809a',
    accent2: '#3CAD00',
    accent3: '#D0913C',
    accent4: '#d44438',
    accent5: '#000000',
    accent6: '#000000'
  },
  dark: {
    default: '#111111',
    overlay: '#191919',
    hover: '#292929',
    alert: '#1A2F0E',
    defaultInverted: '#FFFFFF',
    overlayInverted: '#FFFFFF',
    divider: '#4C4D4C',
    text: '#f0f0f0',
    textSoft: '#828282',
    textInverted: '#282828',
    textInvertedSoft: '#979797'
  }
}

export const variableColorKeys = [
  'default',
  'overlay',
  'hover',
  'alert',
  'defaultInverted',
  'overlayInverted',
  'divider',
  'text',
  'textSoft',
  'textInverted',
  'textInvertedSoft'
]

//add all deprecated colors, but only if they don't exist in new colors (no overwrites)
Object.keys(colorsDeprecated).forEach(key => {
  if (!colors[key]) {
    colors[key] = colorsDeprecated[key]
  }
})

console.log(colors)

export default colors
