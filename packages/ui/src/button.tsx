import { Button as BaseButton } from '@base-ui/react/button'
import { button } from '@republik/theme/recipes'
import type { ButtonVariantProps } from '@republik/theme/recipes'
import type { ComponentPropsWithoutRef } from 'react'

type ButtonProps = ButtonVariantProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonVariantProps>

export function Button({ variant, size, className, ...props }: ButtonProps) {
  const recipeClassName = button({ variant, size })
  return (
    <BaseButton
      className={className ? `${recipeClassName} ${className}` : recipeClassName}
      {...props}
    />
  )
}
