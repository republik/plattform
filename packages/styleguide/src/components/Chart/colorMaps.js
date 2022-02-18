import { scaleOrdinal } from 'd3-scale'

/*
 * extracted from https://raw.githubusercontent.com/srfdata/swiss-party-colors/master/definitions.json
 * swiss-party-colors by SRF Data is licensed under a
 * Creative Commons Namensnennung - Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
 */
const swissPartyColors = {
  EAG: '#AD4F89',
  PDA: '#BF3939',
  AL: '#A83232',
  SOL: '#A83232',
  DA: '#A83232',
  SE: '#A83232',
  KP: '#8C2736',
  JA: '#8C2736',
  JSVR: '#F0554D',
  SP: '#F0554D',
  JUSO: '#F0554D',
  GPS: '#84B547',
  GRÜNE: '#84B547',
  JG: '#84B547',
  GLP: '#C4C43D',
  JGLP: '#C4C43D',
  BDP: '#E6C820',
  JBDP: '#E6C820',
  EVP: '#DEAA28',
  JEVP: '#DEAA28',
  MITTE: '#D6862B',
  CVP: '#D6862B',
  JCVP: '#D6862B',
  CSPO: '#E3BA24',
  JCSPO: '#E3BA24',
  PPS: '#E7B661',
  LDU: '#1BAA6E',
  CSP: '#35AEB2',
  JCSP: '#35AEB2',
  PCSI: '#35AEB2',
  LPS: '#618DEA',
  LDP: '#618DEA',
  JLDP: '#618DEA',
  FDP: '#3872B5',
  JFS: '#3872B5',
  UP: '#3872B5',
  SVP: '#4B8A3E',
  JSVP: '#4B8A3E',
  MCR: '#49A5E7',
  MCRJ: '#49A5E7',
  LEGA: '#9070D4',
  PNOS: '#B07F3E',
  EDU: '#A65E42',
  JEDU: '#A65E42',
  SD: '#9D9D9D',
  AUTO: '#9D9D9D',
  FPS: '#9D9D9D',
  NONE: '#B8B8B8',
  OTHER: '#B8B8B8',
}

export const colorMaps = { swissPartyColors }
export const CHART_DEFAULT_FILL = '#E0E0E0'

export const getColorMapper = (props, colorValues = []) => {
  const colorMapProp = props.colorMap
  if (colorMapProp) {
    const colorMap =
      colorMaps[colorMapProp] ||
      Object.keys(colorMapProp).reduce((map, key) => {
        map[key.toUpperCase()] = colorMapProp[key]
        return map
      }, {})

    return (value = '') => colorMap[value.toUpperCase()] || CHART_DEFAULT_FILL
  }
  let colorRange = props.colorRanges[props.colorRange] || props.colorRange
  if (!colorRange) {
    colorRange =
      colorValues.length > 3
        ? props.colorRanges.discrete
        : props.colorRanges.sequential3
  }
  return scaleOrdinal(colorRange).domain(colorValues)
}
