export const timeBarEditorSchema = ({
  dataColumnEnum,
  optionalDataColumnEnum,
  defaults,
  numberFormats,
  timeFormats,
  colorDropdownItems,
  xScaleTypes,
  chartSizes,
  columnAmount,
}) => {
  return {
    defaultProps: defaults,
    properties: {
      basic: {
        xAxis: {
          title: 'Horizontale Achse',
          properties: {
            x: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: dataColumnEnum,
            },
            timeFormat: {
              type: 'string',
              enum: timeFormats,
              format: 'dynamicDropdown',
              parent: 'xAxis',
            },
            xUnit: {
              title: 'Achsenbeschriftung',
              type: 'string',
            },
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            numberFormat: {
              type: 'string',
              enum: numberFormats,
              parent: 'yAxis',
              format: 'dynamicDropdown',
            },
            unit: {
              title: 'Achsenbeschriftung',
              type: 'string',
            },
          },
        },
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
        xAxis: {
          title: 'Horizontale Achse',
          properties: {
            xTicks: {
              title: 'Achsenticks',
              type: 'array',
              contains: {
                type: 'string',
              },
            },
            xScale: {
              title: 'Skala',
              type: 'string',
              enum: xScaleTypes,
            },
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            yTicks: {
              title: 'Achsenticks',
              type: 'array',
              contains: {
                type: 'string',
              },
            },
            domain: {
              title: 'Bandbreite der Achsen',
              type: 'array',
              contains: {
                type: 'string',
              },
            },
            yScaleInvert: {
              title: 'Y-Achse umdrehen',
              type: 'boolean',
            },
          },
        },
        layout: {
          title: 'Layout',
          properties: {
            size: {
              title: 'Darstellung im Beitrag',
              type: 'string',
              enum: chartSizes,
            },
            height: {
              title: 'Höhe',
              type: 'number',
            },
            minInnerWidth: {
              title: 'Minimale Breite',
              type: 'number',
            },
          },
        },
      },
    },
  }
}
