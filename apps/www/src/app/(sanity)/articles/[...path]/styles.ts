import { css } from '@republik/theme/css'

export const editorialWidth = {
  marginX: 'auto',
  maxWidth: 'editorial',
  pl: '15px',
  pr: '15px',
  display: 'block',
}

export const articleTypography = css({
  mt: '12',
  mb: '20',
  '& a': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  '& p': {
    ...editorialWidth,
    my: '8',
    textStyle: 'editorialParagraph',
    '& em, & i': {
      fontStyle: 'italic',
    },
    '& strong, & b': {
      fontWeight: 700,
    },
  },
  '& h2 + p': {
    marginTop: 0,
  },
  '& h2': {
    ...editorialWidth,
    textStyle: 'editorialH2',
    mt: '36px',
    mb: '8px',
    md: {
      mt: '46px',
      mb: '12px',
    },
    _first: {
      marginTop: 0,
    },
    _last: {
      marginBottom: 0,
    },
  },
})
