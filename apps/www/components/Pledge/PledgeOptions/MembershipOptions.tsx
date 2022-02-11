import React, { useMemo, useState } from 'react'
import { css } from 'glamor'
import { descending } from 'd3-array'
import AutosizeInput from 'react-textarea-autosize'
import {
  mediaQueries,
  plainButtonRule,
  useColorContext,
  Field,
  Interaction,
  fontStyles,
  Checkbox,
} from '@project-r/styleguide'

import FieldSet, { styles as fieldSetStyles } from '../../FieldSet'
import {
  getOptionFieldKey,
  getOptionPeriodsFieldKey,
  getOptionValue,
  reasonError,
} from '../CustomizePackage'
import {
  OptionType,
  SuggestionType,
  FieldSetValues,
} from './PledgeOptionsTypes'

const styles = {
  suggestionsContainer: css({
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  disabled: css({
    opacity: 0.5,
    pointerEvents: 'none',
  }),
  button: css({
    flex: 1,
    padding: 12,
    textAlign: 'left',
    flexWrap: 'wrap',
    display: 'flex',
    flexDirection: 'row',
    [mediaQueries.mUp]: {
      flexDirection: 'column',
    },
    ':not(:first-of-type)': {
      marginTop: 4,
      [mediaQueries.mUp]: {
        margin: '0px 0px 0px 4px',
      },
    },
  }),
  label: css(Interaction.fontRule, {
    margin: 0,
    paddingRight: 6,
    ...fontStyles.sansSerifRegular15,
    lineHeight: '18px',
    [mediaQueries.mUp]: {
      paddingRight: 0,
      ...fontStyles.sansSerifRegular16,
      lineHeight: '22px',
    },
  }),
  infocontainer: css({
    order: 9,
    padding: '16px 0px 16px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }),
  fieldContainer: css({
    display: 'flex',
    flexDirection: 'column',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: 24,
    },
  }),
}

const MembershipOptions = ({
  options,
  hasGiftMemberships,
  values,
  errors,
  dirty,
  onChange,
  onPriceChange,
  goodiePrice,
  userPrice: queryUserPrice,
}: {
  values: FieldSetValues
  errors: Record<string, any>
  dirty: Record<string, any>
  hasGiftMemberships: boolean
  options: OptionType[]
  onChange: (options) => void
  onPriceChange: (event: Event, value: number, shouldValidate: boolean) => void
  goodiePrice: number
  userPrice: number
}) => {
  const suggestions = useMemo(() => {
    return options.map((option) => {
      // append option to each suggestion object
      const suggestionsWithOption = option.suggestions.map((suggestion) => ({
        ...suggestion,
        option,
      }))
      if (queryUserPrice) {
        return suggestionsWithOption.filter(
          (suggestion) =>
            !!suggestion.userPriceFallback || suggestion.price === 24000,
        )
      } else {
        // filter out userPriceFallback suggestion
        return suggestionsWithOption.filter(
          (suggestion) =>
            !suggestion.userPriceFallback ||
            (suggestion.userPriceFallback && suggestion.favorite),
        )
      }
    })
  }, [options]).flat()

  const [colorScheme] = useColorContext()

  const buttonStyle = useMemo(
    () => ({
      default: css({
        backgroundColor: colorScheme.getCSSColor('hover'),
        '@media (hover)': {
          ':hover': {
            backgroundColor: colorScheme.getCSSColor('divider'),
          },
        },
      }),
      selected: css({
        backgroundColor: colorScheme.getCSSColor('text'),
        color: colorScheme.getCSSColor('default'),
      }),
    }),
    [colorScheme],
  )

  const [disabledSuggestion, setDisabledSuggestion] = useState(null)
  const selectedSuggestion = suggestions
    .filter(
      (suggestion) =>
        suggestion.price <= values.price - goodiePrice &&
        getOptionValue(suggestion.option, values) >= 1,
    )
    .sort((a, b) => descending(a.price, b.price))[0]

  return (
    <>
      <div
        {...styles.suggestionsContainer}
        {...(!!disabledSuggestion && styles.disabled)}
      >
        {suggestions.map((suggestion: SuggestionType, index) => {
          const { price, label, description, userPrice, option } = suggestion
          const isSelected =
            disabledSuggestion?.id === suggestion.id ||
            selectedSuggestion === suggestion
          // option.additionalPeriods is only true on PROLONG, which is where we don't need a period or amount selector
          const requiresPeriodSelector =
            !option.additionalPeriods &&
            option.reward?.minPeriods !== option.reward?.maxPeriods

          const requiresAmountSelector =
            !option.additionalPeriods && option.minAmount !== option.maxAmount

          return (
            <>
              {/* only render buttons if there are more than one suggestions */}
              {suggestions.length > 1 ? (
                <button
                  disabled={!!disabledSuggestion}
                  key={label}
                  {...plainButtonRule}
                  {...styles.button}
                  {...(isSelected ? buttonStyle.selected : buttonStyle.default)}
                  onClick={() => {
                    onChange(
                      FieldSet.utils.fieldsState({
                        field: getOptionFieldKey(option),
                        value: 1,
                        error: undefined,
                        dirty: true,
                      }),
                    )
                    onPriceChange(
                      undefined,
                      (values.price -
                        selectedSuggestion.price +
                        suggestion.price) /
                        100,
                      true,
                    )
                  }}
                  style={{ order: index }}
                >
                  <p {...styles.label}>
                    <span>{label}</span>
                    <br />
                    <span style={{ opacity: userPrice ? 0 : 1 }}>
                      CHF {price / 100}
                    </span>
                  </p>
                </button>
              ) : null}
              <div
                {...styles.infocontainer}
                style={{
                  display: isSelected ? 'inherit' : 'none',
                }}
              >
                <Interaction.P>{description}</Interaction.P>

                {userPrice && (
                  <>
                    <Field
                      disabled={!!disabledSuggestion}
                      label='Betrag in CHF'
                      value={values.price / 100 || price / 100}
                      renderInput={(props) => (
                        <input inputMode='numeric' {...props} />
                      )}
                      error={dirty.price && errors.price}
                      onChange={onPriceChange}
                      onDec={
                        values.price - 1000 >= suggestion.minUserPrice &&
                        (() => {
                          onPriceChange(
                            undefined,
                            (values.price - 1000) / 100,
                            dirty.price,
                          )
                        })
                      }
                      onInc={
                        values.price + 1000 < suggestion.option.price &&
                        (() => {
                          onPriceChange(
                            undefined,
                            (values.price + 1000) / 100,
                            dirty.price,
                          )
                        })
                      }
                    />
                    {/* only show reasons if price is below regularMinPrice TODO: replace 24000 with regularMinPrice */}
                    {values.price - goodiePrice <= 24000 && (
                      <Field
                        // label={t('package/customize/userPrice/reason/label')}
                        label='Grund'
                        // ref={this.focusRefSetter}
                        error={dirty.reason && errors.reason}
                        value={values.reason}
                        renderInput={({ ref, ...inputProps }) => (
                          <AutosizeInput
                            {...inputProps}
                            {...fieldSetStyles.autoSize}
                            inputRef={ref}
                          />
                        )}
                        onChange={(_, value, shouldValidate) => {
                          onChange(
                            FieldSet.utils.fieldsState({
                              field: 'reason',
                              value,
                              // error: reasonError(value.toString(), t),
                              error: undefined,
                              dirty: shouldValidate,
                            }),
                          )
                        }}
                      />
                    )}
                  </>
                )}

                {requiresPeriodSelector || requiresAmountSelector ? (
                  <div {...styles.fieldContainer}>
                    {requiresAmountSelector && (
                      <Field
                        label={'Anzahl Abos'}
                        disabled={!!disabledSuggestion}
                        value={
                          values[getOptionPeriodsFieldKey(option)] === undefined
                            ? option.reward.defaultPeriods
                            : values[getOptionPeriodsFieldKey(option)]
                        }
                        onChange={(_, value) =>
                          onChange(
                            FieldSet.utils.fieldsState({
                              field: getOptionPeriodsFieldKey(option),
                              value: Math.min(
                                Math.max(+value, option.reward.minPeriods),
                                option.reward.maxPeriods,
                              ),
                              error: undefined,
                              dirty: true,
                            }),
                          )
                        }
                        renderInput={(props) => (
                          <input inputMode='numeric' {...props} />
                        )}
                      />
                    )}
                    {requiresPeriodSelector && (
                      <Field
                        label={'Anzahl Monate'}
                        value={getOptionValue(option, values)}
                        disabled={!!disabledSuggestion}
                        onChange={(_, value) => {
                          onChange(
                            FieldSet.utils.fieldsState({
                              field: getOptionFieldKey(option),
                              value: Math.min(
                                Math.max(+value, option.minAmount),
                                option.maxAmount,
                              ),
                              error: undefined,
                              dirty: true,
                            }),
                          )
                        }}
                        renderInput={(props) => (
                          <input inputMode='numeric' {...props} />
                        )}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )
        })}
      </div>
      {hasGiftMemberships && (
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            black
            checked={!!disabledSuggestion}
            onChange={() => {
              if (!disabledSuggestion) {
                onChange(
                  options.reduce((fields, option) => {
                    return FieldSet.utils.mergeField({
                      field: getOptionFieldKey(option),
                      value: 0,
                      error: undefined,
                      dirty: false,
                    })(fields)
                  }, {}),
                )
                onPriceChange(
                  undefined,
                  (values.price - selectedSuggestion.price) / 100,
                  true,
                )
                setDisabledSuggestion(selectedSuggestion)
              } else {
                onChange(
                  FieldSet.utils.fieldsState({
                    field: getOptionFieldKey(disabledSuggestion.option),
                    value: 1,
                    error: undefined,
                    dirty: true,
                  }),
                )
                onPriceChange(
                  undefined,
                  (values.price + disabledSuggestion.price) / 100,
                  true,
                )
                setDisabledSuggestion(null)
              }
            }}
          >
            nur Geschenkmitgliedschaften verlängern
          </Checkbox>
        </div>
      )}
    </>
  )
}

export default MembershipOptions
