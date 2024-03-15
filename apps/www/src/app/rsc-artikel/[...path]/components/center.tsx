import { css } from '@app/styled-system/css'

export const Center = (props) => {
  return (
    <div
      className={css({
        textStyle: 'serifRegular',
        fontSize: 'xl',
        maxWidth: '[665px]',
        margin: 'auto',
        '& a': {
          color: 'text',
        },
        '& p': {
          mb: '4',
        },
        '& strong': {
          fontWeight: 'medium',
        },
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          textStyle: 'serifBold',
          mb: '4',
          mt: '8',
          '&:first-of-type': { mt: '0' },
        },
      })}
      {...props}
    />
  )
}
