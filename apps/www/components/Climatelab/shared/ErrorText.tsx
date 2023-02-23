import { css } from 'glamor'
import { FC, ReactNode } from 'react'
import { fontStyles } from '@project-r/styleguide'

const ErrorText: FC<{ children?: ReactNode }> = ({ children }) => (
  <p {...styles.text}>{children}</p>
)

export default ErrorText

const styles = {
  text: css({
    ...fontStyles.sansSerifRegular,
    display: 'inline-flex',
    width: 'max-content',
    fontSize: 16,
    backgroundColor: 'white',
    color: '#BA0000',
    padding: '8px 16px',
    borderRadius: 8,
  }),
}
