export const hemicycleEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  colorDropdownItems,
  chartSizes,
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
              enum: optionalDataColumnEnum,
            },
            colorRange: {
              title: 'Farbschema auswählen',
              type: 'string',
              enum: colorDropdownItems,
            },
          },
        },
      },
      advanced: {
        layout: {
          title: 'Layout',
          properties: {
            size: {
              title: 'Darstellung im Beitrag',
              type: 'string',
              enum: chartSizes,
            },
          },
        },
      },
    },
  }
}
