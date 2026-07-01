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
    textStyle: 'subtitleBold',
    mb: 4,
  },
  '& .tagline': {
    fontFamily: 'rubis',
    fontWeight: 300,
    fontStyle: 'italic',
    fontSize: 16,
  },
})
