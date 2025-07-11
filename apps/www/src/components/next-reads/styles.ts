import { css } from '@republik/theme/css'

export const nextReadsSection = css({
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: 'contrast',
  maxWidth: '1700px',
  margin: '0 auto',
  textAlign: 'center',
})

export const nextReadHeader = css({
  mt: 8,
  mb: 8,
  '& h3': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1,
    mb: 4,
  },
  '& .tagline': {
    fontFamily: 'rubis',
    fontWeight: 300,
    fontStyle: 'italic',
    fontSize: 16,
  },
})

export const nextReadItemTypography = css({
  // title of the document
  '& h4': {
    fontFamily: 'rubis',
    fontWeight: 'medium',
    fontSize: 18,
    lineHeight: 1.2,
    marginBottom: 2,
  },
  // format or series name
  '& h5': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  '& p.description': {
    fontFamily: 'rubis',
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  '& p.author': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
  },
  '& p.duration': {
    fontFamily: 'gtAmericaStandard',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.2,
  },
})
