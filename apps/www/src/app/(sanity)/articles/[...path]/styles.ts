import { css } from '@republik/theme/css'

export const articleTypography = css({
  mt: '12',
  mb: '20',
  '& p': {
    my: '8',
    textStyle: 'editorialParagraph',
    '& em, & i': {
      fontStyle: 'italic',
    },
    '& strong, & b': {
      fontWeight: 700,
    },
    _firstOfType: {
      marginTop: 0,
    },
    _lastOfType: {
      marginBottom: 0,
    },
    'h2 + &': {
      marginTop: 0,
    },
  },
  '& h2': {
    textStyle: 'editorialH2',
    margin: '36px 0 8px 0',
    md: {
      margin: '46px 0 12px 0',
    },
    _first: {
      marginTop: 0,
    },
    _last: {
      marginBottom: 0,
    },
  },
})
