import { Form as RadixForm, RadioGroup as RadixRadioGroup } from 'radix-ui'

import { css } from '@republik/theme/css'

const styles = {
  Group: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '2',
  }),
  Radio: css({
    display: 'grid',
    placeContent: 'center',
    width: '[20px]',
    height: '[20px]',
    background: 'transparent',
    border: '2px solid',
    borderRadius: 'full',
    borderColor: 'text',

    alignSelf: 'center',

    _checked: {
      background: 'text',
    },
  }),
  Indicator: css({
    display: 'block',
    width: '[0.4em]',
    height: '[0.4em]',
    borderRadius: 'full',
    backgroundColor: 'text.inverted',
  }),
}

export function RadioGroup(props: RadixRadioGroup.RadioGroupProps) {
  return <RadixRadioGroup.Root className={styles.Group} {...props} />
}
export function Radio(props: RadixRadioGroup.RadioGroupItemProps) {
  return (
    <RadixRadioGroup.Item className={styles.Radio} {...props}>
      <RadixRadioGroup.Indicator className={styles.Indicator} />
    </RadixRadioGroup.Item>
  )
}
