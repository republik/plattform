import { ReactNode } from 'react'
import {
  plainButtonRule,
  plainLinkRule,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'

type ButtonProps = {
  children?: ReactNode
  disabled?: boolean
  href?: string
  onClick?: () => void | Promise<void>
}

const Button = ({ children, onClick, href, disabled }: ButtonProps) => {
  const [colorScheme] = useColorContext()

  if (href) {
    return (
      <Link href={href} passHref>
        <a
          {...plainLinkRule}
          {...style}
          {...colorScheme.set('color', disabled ? 'disabled' : 'default')}
          {...colorScheme.set('backgroundColor', 'text')}
        >
          {children}
        </a>
      </Link>
    )
  }

  return (
    <button
      {...plainButtonRule}
      {...style}
      {...colorScheme.set('color', disabled ? 'disabled' : 'default')}
      {...colorScheme.set('backgroundColor', 'text')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button

const style = css({
  height: '3.75rem',
  fontSize: '1.375rem',
  minWidth: 160,
  width: '100%',
  padding: '10px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
})
