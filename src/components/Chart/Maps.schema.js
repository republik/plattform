export const genericMapEditorSchema = ({
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
        },
        layout: {
          title: 'Aufteilung in Spalten',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile:',
              type: 'number'
            }
          }
        }
      },
      advanced: {}
    }
  }
}

export const projectedMapEditorSchema = ({
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
        },
        layout: {
          title: 'Aufteilung in Spalten',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile:',
              type: 'number'
            }
          }
        }
      },
      advanced: {}
    }
  }
}

export const swissMapEditorSchema = ({
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
        },
        layout: {
          title: 'Aufteilung in Spalten',
          properties: {
            column: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum
            },
            columns: {
              title: 'Anzahl Spalten pro Zeile:',
              type: 'number'
            }
          }
        }
      },
      advanced: {}
    }
  }
}
