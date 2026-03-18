import { Button as BaseButton } from '@base-ui/react/button'
import type { ButtonVariantProps } from '@republik/theme/recipes'
import { button } from '@republik/theme/recipes'

type ButtonProps = ButtonVariantProps & BaseButton.Props

export function Button({ variant, size, ...props }: ButtonProps) {
  return <BaseButton className={button({ variant, size })} {...props} />
}
