import type { ButtonVariantProps } from '@republik/theme/recipes'
import { button } from '@republik/theme/recipes'

type ButtonProps = ButtonVariantProps & React.ComponentPropsWithoutRef<'button'>

export function Button({ variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={button({ variant, size })} {...props} />
}
