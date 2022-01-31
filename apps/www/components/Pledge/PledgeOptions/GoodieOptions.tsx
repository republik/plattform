import React from 'react'
import { css } from 'glamor'
import { Interaction } from '@project-r/styleguide'
import Goodie from './Goodie'
import { OptionType, FieldSetValues } from './PledgeOptionsTypes'
import FieldSet from '../../FieldSet'
import { getOptionFieldKey } from '../CustomizePackage'

type GoodieOptionsPropTypes = {
  options: OptionType[]
  values: FieldSetValues
  onChange: (fields) => void
  t: (string: string) => string
}

const styles = {
  goodieContainer: css({ marginBottom: 24 })
}

function GoodieOptions({
  options,
  values,
  onChange,
  t
}: GoodieOptionsPropTypes) {
  if (!options?.length) {
    return null
  }

  return (
    <>
      <Interaction.H3>{t('Goodies/title')}</Interaction.H3>

      <div {...styles.goodieContainer}>
        {options.map(option => {
          const value =
            values[getOptionFieldKey(option)] === undefined
              ? option.defaultAmount
              : values[getOptionFieldKey(option)]

          return (
            <Goodie
              key={getOptionFieldKey(option)}
              option={option}
              value={value}
              onChange={value =>
                onChange(
                  FieldSet.utils.fieldsState({
                    field: getOptionFieldKey(option),
                    value,
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
    </>
  )
}

export default GoodieOptions
