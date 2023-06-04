import { FC, ReactNode } from 'react'
import { css } from 'glamor'
import NextLink from 'next/link'
import {
  fontStyles,
  useColorContext,
  plainButtonRule,
  plainLinkRule,
} from '@project-r/styleguide'

type ButtonProps = {
  children?: ReactNode
  onClick?: () => void
  href?: string
  type?: 'submit' | 'button'
  disabled?: boolean
}

const Button: FC<ButtonProps> = ({
  children,
  href,
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const [colorScheme] = useColorContext()

  if (href) {
    return (
      <NextLink href={href} passHref>
        <a
          {...colorScheme.set('backgroundColor', 'primary')}
          {...colorScheme.set('color', 'climateButtonText')}
          {...colorScheme.set('borderColor', 'climateBorder')}
          {...css({
            ':hover': {
              backgroundColor: colorScheme.getCSSColor('primaryHover'),
            },
          })}
          {...plainLinkRule}
          {...styles.button}
        >
          {children}
        </a>
      </NextLink>
    )
  }

  return (
    <button
      {...colorScheme.set('backgroundColor', 'primary')}
      {...colorScheme.set('color', 'climateButtonText')}
      {...colorScheme.set('borderColor', 'climateBorder')}
      {...css({
        ':hover': {
          backgroundColor: colorScheme.getCSSColor('primaryHover'),
        },
      })}
      {...plainButtonRule}
      {...styles.button}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

const styles = {
  button: css({
    ...fontStyles.sansSerifBold,
    fontSize: 30,
    boxSizing: 'border-box',
    padding: '12px 16px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    '&:disabled': {
      opacity: 0.8,
    },
  }),
}
