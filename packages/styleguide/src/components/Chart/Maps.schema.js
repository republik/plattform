export const genericMapEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  colorDropdownItems,
  chartSizes,
  columnAmount,
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
        layout: {
          title: 'Aufteilen in mehrere Charts',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum,
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile',
              type: 'number',
              enum: columnAmount,
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

export const projectedMapEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  colorDropdownItems,
  chartSizes,
  columnAmount,
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
        layout: {
          title: 'Aufteilen in mehrere Charts',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum,
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile',
              type: 'number',
              enum: columnAmount,
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

export const swissMapEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  colorDropdownItems,
  chartSizes,
  columnAmount,
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
        layout: {
          title: 'Aufteilen in mehrere Charts',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum,
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile',
              type: 'number',
              enum: columnAmount,
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
