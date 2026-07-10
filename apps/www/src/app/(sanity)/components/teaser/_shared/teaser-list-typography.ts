import { css } from '@republik/theme/css'

export const typography = css({
  // title of the document
  '& h4': {
    fontFamily: 'rubis',
    fontWeight: 'medium',
    fontSize: 18,
    lineHeight: 1.2,
  },
  '& h4.editorial': {
    fontFamily: 'republikSerif',
    fontWeight: 'black',
    fontSize: 'l',
    lineHeight: 1.1,
    md: { fontSize: 'xl' },
  },
  '& h4.meta': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 'medium',
    fontSize: 18,
    lineHeight: 1.2,
  },
  // format or series name
  '& h5': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  '& p.description': {
    fontFamily: 'rubis',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.5,
  },
  '& p.author': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  '& p.time': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.2,
  },
})
