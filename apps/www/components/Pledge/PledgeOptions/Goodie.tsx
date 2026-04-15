import { css } from 'glamor'
import {
  Dropdown,
  mediaQueries,
  fontStyles,
  Interaction,
  useColorContext,
} from '@project-r/styleguide'
import { PledgeOptionType } from './GoodieOptions'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

type PledgeOptionComponentType = {
  option: PledgeOptionType
  value: number
  onChange: (item) => void
  t: (string) => string
}

const IMAGE_SIZE = 64

const styles = {
  container: css({
    display: 'flex',
    margin: '16px 0',
    flexDirection: 'column',
    justifyContent: 'space-between',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  info: css({
    display: 'flex',
    flexDirection: 'row',
  }),
  goodieImage: css({
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: 16,
    flexShrink: 0,
  }),
  label: css(Interaction.fontRule, {
    flexGrow: 1,
    marginRight: 0,
    ...fontStyles.sansSerifRegular15,
    [mediaQueries.mUp]: {
      marginRight: 16,
      ...fontStyles.sansSerifRegular17,
    },
    margin: 0,
  }),
  selection: css({
    minWidth: 100,
    marginLeft: IMAGE_SIZE + 16,
    [mediaQueries.mUp]: {
      marginLeft: 0,
    },
  }),
}

function GoodieOption({
  value,
  option,
  onChange,
  t,
}: PledgeOptionComponentType) {
  const [colorScheme] = useColorContext()
  const amounts = Array.from(
    { length: option.maxAmount - option.minAmount + 1 },
    (_, index) => String(index + option.minAmount),
  )
  const dropdownItems = amounts.map((amount) => ({
    value: amount,
    text: amount,
  }))
  return (
    <>
      <div {...styles.container}>
        <div {...styles.info}>
          <img
            {...styles.goodieImage}
            {...colorScheme.set('backgroundColor', 'hover')}
            src={`${CDN_FRONTEND_BASE_URL}/static/packages/${option.reward.name.toLowerCase()}.png`}
          />

          <p {...styles.label}>
            <strong>
              {t(`Goodie/label/${option.reward.name}`)}
              {`, CHF ${option.price / 100}`}
            </strong>
            <br />
            {t(`Goodie/description/${option.reward.name}`)}
          </p>
        </div>
        <div {...styles.selection}>
          <Dropdown
            label={t('Goodie/dropdown/label')}
            items={dropdownItems}
            value={String(value)}
            onChange={(item) => {
              onChange(+item.value)
            }}
          />
        </div>
      </div>
    </>
  )
}

export default GoodieOption
