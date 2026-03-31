import { Switch as BaseSwitch } from '@base-ui/react'

import { switchRecipe } from '@republik/theme/recipes'

const styles = switchRecipe()

export function Switch(props: BaseSwitch.Root.Props) {
  return (
    <BaseSwitch.Root className={styles.root} {...props}>
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  )
}
