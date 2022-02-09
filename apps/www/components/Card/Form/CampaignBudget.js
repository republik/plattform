import React from 'react'
import AutosizeInput from 'react-textarea-autosize'

import { Field, Interaction } from '@project-r/styleguide'

import { styles as fieldSetStyles } from '../../FieldSet'

const { H2 } = Interaction

const CampaignBudget = ({
  budget,
  handleBudget,
  budgetComment,
  handleBudgetComment,
}) => (
  <>
    <H2>Wahlkampf-Budget</H2>
    <Field
      label='Ihr Wahlkampf-Budget (in CHF)'
      value={budget.value}
      error={budget.dirty && budget.error}
      dirty={budget.dirty}
      onChange={(_, value, shouldValidate) =>
        handleBudget(value, shouldValidate)
      }
    />
    <Field
      label={'Bemerkungen zum Wahlkampf-Budget'}
      renderInput={({ ref, ...inputProps }) => (
        <AutosizeInput
          {...inputProps}
          {...fieldSetStyles.autoSize}
          inputRef={ref}
        />
      )}
      value={budgetComment.value}
      error={budgetComment.dirty && budgetComment.error}
      dirty={budgetComment.dirty}
      onChange={(_, value, shouldValidate) =>
        handleBudgetComment(value, shouldValidate)
      }
    />
  </>
)

export default CampaignBudget
