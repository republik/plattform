import React from 'react'
import { css } from 'glamor'
import {
  Checkbox,
  mediaQueries,
  fontStyles,
  Interaction
} from '@project-r/styleguide'
import { OptionType } from './PledgeOptionsTypes'

const styles = {
  container: css({
    display: 'flex',
    margin: '16px 0',
    flexDirection: 'column',
    justifyContent: 'space-between',
    [mediaQueries.mUp]: {
      flexDirection: 'row'
    }
  }),
  label: css(Interaction.fontRule, {
    flexGrow: 1,
    marginRight: 0,
    ...fontStyles.sansSerifRegular15,
    [mediaQueries.mUp]: {
      marginRight: 16,
      ...fontStyles.sansSerifRegular17
    },
    margin: 0
  }),
  selection: css({
    minWidth: 100,
    marginLeft: 16,
    [mediaQueries.mUp]: {
      marginLeft: 0
    }
  })
}

const GiftMembership = ({
  option,
  value,
  onChange,
  t
}: {
  value: number
  onChange: (fields) => void
  option: OptionType
  t: (any) => any
}) => {
  const suggestion = option.suggestions[0]
  return (
    <div {...styles.container}>
      <p {...styles.label}>
        <strong>{suggestion.label}</strong>
        <br />
        {suggestion.description}
      </p>
      <div {...styles.selection}>
        <Checkbox
          name='Gift Membership'
          checked={!!value}
          onChange={(_, checked) => {
            onChange(checked)
          }}
        >
          {`für ${option.price} verlängern`}
        </Checkbox>
      </div>
    </div>
  )
}

export default GiftMembership
