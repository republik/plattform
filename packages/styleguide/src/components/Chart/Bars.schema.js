export const barEditorSchema = ({
  optionalDataColumnEnum,
  defaults,
  numberFormats,
  colorDropdownItems,
  sortingOptions,
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
            numberFormat: {
              title: 'Zahlenformat',
              type: 'string',
              enum: numberFormats,
            },
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            y: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: optionalDataColumnEnum,
            },
            unit: {
              title: 'Beschriftung',
              type: 'string',
            },
            sort: {
              title: 'Sortierung',
              type: 'string',
              enum: sortingOptions,
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
            showBarValues: {
              title: 'Balken mit Wert anschreiben (ausserhalb)',
              type: 'boolean',
            },
            inlineValue: {
              title: 'Balken mit Wert anschreiben (innerhalb)',
              type: 'boolean',
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

export const lollipopEditorSchema = ({
  dataColumnEnum,
  optionalDataColumnEnum,
  defaults,
  numberFormats,
  colorDropdownItems,
  sortingOptions,
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
            numberFormat: {
              title: 'Zahlenformat',
              type: 'string',
              enum: numberFormats,
            },
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            y: {
              title: 'Spalte auswählen',
              type: 'string',
              enum: dataColumnEnum,
            },
            unit: {
              title: 'Achsenbeschriftung',
              type: 'string',
            },
            sort: {
              title: 'Sortierung',
              type: 'string',
              enum: sortingOptions,
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
            showBarValues: {
              title: 'Lollipop ausserhalb mit Wert anschreiben',
              type: 'boolean',
            },
          },
        },
        yAxis: {
          title: 'Vertikale Achse',
          properties: {
            domain: {
              title: 'Bandbreite der Achsen',
              type: 'array',
              contains: {
                type: 'string',
              },
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
          },
        },
      },
    },
  }
}
