export const hemicycleEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  colorDropdownItems
}) => {
  return {
    defaultProps: defaults,
    properties: {
      basic: {
        color: {
          title: 'Farbe',
          properties: {
            color: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum
            },
            colorRange: {
              title: 'Farbschema auswählen',
              type: 'string',
              enum: colorDropdownItems
            }
          }
        }
      },
      advanced: {}
    }
  }
}
