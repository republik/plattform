import React, { useMemo } from 'react'
import { Interaction } from '@project-r/styleguide'
import { OptionType, FieldSetValues } from './PledgeOptionsTypes'
import GiftMembership from './GiftMembership'
import { getOptionFieldKey } from '../CustomizePackage'
import FieldSet from '../../FieldSet'

const GiftMembershipOptions = ({
  options,
  values,
  onChange,
  t
}: {
  options: OptionType[]
  values: FieldSetValues
  onChange: (fields) => void
  t?: (string: string) => string
}) => {
  if (!options?.length) {
    return null
  }
  return (
    <div>
      <Interaction.H3>Geschenkmitgliedschaften</Interaction.H3>
      {options.map(option => {
        const value =
          values[getOptionFieldKey(option)] === undefined
            ? option.defaultAmount
            : values[getOptionFieldKey(option)]
        return (
          <GiftMembership
            key={option.id}
            option={option}
            value={value}
            onChange={checked =>
              onChange(
                FieldSet.utils.fieldsState({
                  field: getOptionFieldKey(option),
                  value: checked ? option.defaultAmount : 0,
                  error: undefined,
                  dirty: true
                })
              )
            }
            t={t}
          />
        )
      })}
    </div>
  )
}

export default GiftMembershipOptions
