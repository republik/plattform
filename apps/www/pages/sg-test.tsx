import { Button } from '@project-r/styleguide'
import { css } from '@republik/theme/css'
import {
  legacyButton,
  type LegacyButtonVariantProps,
} from '@republik/theme/recipes'

function LegacyButton(
  props: LegacyButtonVariantProps &
    React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  return <button {...props} className={legacyButton(props)} />
}

export default function SGTestPage() {
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8',
        p: '16',
      })}
    >
      <h2>New</h2>
      <h2>New (Component)</h2>
      <h2>Old</h2>

      <button className={legacyButton()}>Default</button>
      <LegacyButton>Default</LegacyButton>
      <Button>Default</Button>

      <button className={legacyButton({ variant: 'primary' })}>Primary</button>
      <LegacyButton variant='primary'>Primary</LegacyButton>
      <Button primary>Primary</Button>

      <button className={legacyButton({ size: 'small' })}>Small</button>
      <LegacyButton size='small'>Small</LegacyButton>
      <Button small>Small</Button>

      <button className={legacyButton({ variant: 'primary', size: 'small' })}>
        Primary Small
      </button>
      <LegacyButton variant='primary' size='small'>
        Primary Small
      </LegacyButton>
      <Button primary small>
        Primary Small
      </Button>

      <button className={legacyButton({ variant: 'naked' })}>Naked</button>
      <LegacyButton variant='naked'>Naked</LegacyButton>
      <Button naked>Naked</Button>

      <button className={legacyButton({ variant: 'nakedPrimary' })}>
        Primary Naked
      </button>
      <LegacyButton variant='nakedPrimary'>Primary Naked</LegacyButton>
      <Button naked primary>
        Primary Naked
      </Button>

      <button className={legacyButton({ variant: 'naked', size: 'small' })}>
        Naked Small
      </button>
      <LegacyButton variant='naked' size='small'>
        Naked Small
      </LegacyButton>
      <Button naked small>
        Naked Small
      </Button>

      <button
        className={legacyButton({ variant: 'nakedPrimary', size: 'small' })}
      >
        Primary Naked Small
      </button>
      <LegacyButton variant='nakedPrimary' size='small'>
        Primary Naked Small
      </LegacyButton>
      <Button primary naked small>
        Primary Naked Small
      </Button>
    </div>
  )
}
