import { css } from '@app/styled-system/css'

export const Infobox = (props) => {
  return (
    <section
      className={css({
        textStyle: 'sans',
        fontSize: 'base',
        borderTopColor: 'text',
        borderTopWidth: 1,
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          textStyle: 'sansSerifMedium',
        },
      })}
      {...props}
    />
  )
}
