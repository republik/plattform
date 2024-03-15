import { css } from '@app/styled-system/css'
import Link from 'next/link'

export const a = (props) => {
  const [title, description] = (props.title || '').split('%%')

  return description ? (
    <Link
      className={css({
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted',
        textDecorationSkip: 'ink',
        textDecorationThickness: 2,
        textUnderlineOffset: 3,
      })}
      {...props}
      title={title + '\n\n' + description}
    />
  ) : (
    <Link {...props} />
  )
}
