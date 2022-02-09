export const lineEditorSchema = ({
  dataColumnEnum,
  optionalDataColumnEnum,
  defaults,
  numberFormats,
  timeFormats,
  colorDropdownItems,
  xScaleTypes,
  yScaleTypes,
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
              title: 'Zahlenformat',
              type: 'string',
              enum: numberFormats,
              parent: 'yAxis',
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
            yScale: {
              title: 'Skala',
              type: 'string',
              enum: yScaleTypes,
            },
            zero: {
              title: 'Y-Achse bei 0 beginnen',
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
        more: {
          title: 'Weitere Einstellungen',
          properties: {
            band: {
              title: 'Name Konfidenzinterval',
              type: 'string',
            },
            bandLegend: {
              title: 'Legende Konfidenzinterval',
              type: 'string',
            },
            endLabel: {
              title: 'Label am Linienende',
              type: 'boolean',
            },
            endValue: {
              title: 'Wert am Linienende',
              type: 'boolean',
            },
            startValue: {
              title: 'Wert am Linienanfang',
              type: 'boolean',
            },
          },
        },
      },
    },
  }
}

export const slopeEditorSchema = ({
  dataColumnEnum,
  optionalDataColumnEnum,
  defaults,
  numberFormats,
  timeFormats,
  colorDropdownItems,
  xScaleTypes,
  yScaleTypes,
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
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            numberFormat: {
              title: 'Zahlenformat',
              type: 'string',
              enum: numberFormats,
              parent: 'yAxis',
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
            yScale: {
              title: 'Skala',
              type: 'string',
              enum: yScaleTypes,
            },
            zero: {
              title: 'Y-Achse bei 0 beginnen',
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
        more: {
          title: 'Weitere Einstellungen',
          properties: {
            endLabel: {
              title: 'Label am Linienende',
              type: 'boolean',
            },
            endValue: {
              title: 'Wert am Linienende',
              type: 'boolean',
            },
            startValue: {
              title: 'Wert am Linienanfang',
              type: 'boolean',
            },
          },
        },
      },
    },
  }
}
