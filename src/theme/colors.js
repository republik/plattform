import {getJson} from './env'

// some defaults are precomputed colors from d3-scale-chromatic
/*
 sequential3 = [d3.interpolateBlues(1), d3.interpolateBlues(0.8), d3.interpolateBlues(0.6)],
 opposite3 = [d3.interpolateReds(1), d3.interpolateReds(0.8), d3.interpolateReds(0.6)],
 discrete = d3.schemeCategory10
 */

const colors = {
  primary: '#00508C',
  primaryBg: '#BFE1FF',
  secondary: '#00335A',
  secondaryBg: '#D8EEFF',
  disabled: '#B8BDC1',
  text: '#191919',
  lightText: '#979797',
  error: '#9E0041',
  divider: '#DBDCDD',
  online: '#00DC00',
  editorial: '#00B4FF',
  meta: '#64966E',
  social: '#E9A733',
  neutral: '#bbb',
  sequential3: ['rgb(8,48,107)', 'rgb(24,100,170)', 'rgb(75,151,201)'],
  opposite3: ['rgb(103,0,13)', 'rgb(187,21,26)', 'rgb(239,69,51)'],
  discrete: ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf'],
  ...getJson('COLORS')
}

export default colors
