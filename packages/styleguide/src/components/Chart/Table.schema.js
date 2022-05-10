export const tableEditorSchema = ({ defaults, chartSizes }) => {
  return {
    defaultProps: defaults,
    properties: {
      basic: {},
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
