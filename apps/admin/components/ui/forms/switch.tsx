import { Switch as RadixSwitch } from 'radix-ui'

import { switchRecipe } from '@republik/theme/recipes'

const styles = switchRecipe()

export function Switch(props: RadixSwitch.SwitchProps) {
  return (
    <RadixSwitch.Root className={styles.root} {...props}>
      <RadixSwitch.Thumb className={styles.thumb} />
    </RadixSwitch.Root>
  )
}
