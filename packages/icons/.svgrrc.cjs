// See https://react-svgr.com/docs/options/

module.exports = {
  jsxRuntime: 'automatic',
  icon: true,
  typescript: true,
  expandProps: 'end',
  removeDimensions: false,
  replaceAttrValues: {
    '#000': 'currentColor',
    '#000000': 'currentColor',
    black: 'currentColor',
  },
  svgoConfig: {
    plugins: [
      {
        name: 'mergePaths',
        enabled: false,
      },
    ],
  },
  svgoConfig: {
    plugins: [
      {
        name: 'mergePaths',
        enabled: false,
      },
    ],
  },
  svgProps: {
    fill: 'currentColor',
    style:
      "{props.style ? { verticalAlign: 'middle', display: 'inline-block', ...props.style } : { verticalAlign: 'middle', display: 'inline-block' }}",
    width: '{props.width ?? props.size ?? "1em"}',
    height: '{props.height ?? props.size ?? "1em"}',
  },
  indexTemplate: require('./lib/icon-template.cjs'),
  template: (variables, { tpl }) => {
    return tpl`
    ${variables.imports};
    ${variables.interfaces};
    const ${variables.componentName} = (
      props: 
        SVGProps<SVGSVGElement> & 
        {
          // Applies to both the width & height prop
          size?: number | string 
        } 
      ) => (
      ${variables.jsx}
    );

    ${variables.componentName}.displayName = "${variables.componentName}";
    ${variables.exports};
    `
  },
}
