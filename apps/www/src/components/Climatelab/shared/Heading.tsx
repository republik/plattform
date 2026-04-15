import { css } from 'glamor'
import { fontStyles } from '@project-r/styleguide'

type HeadingProps = {
  children?: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

const Heading = ({ children, as: Element = 'h2' }: HeadingProps) => {
  return <Element {...style}>{children}</Element>
}

export default Heading

const style = css({
  ...fontStyles.serifBold32,
  lineHeight: '1.4em',
})
