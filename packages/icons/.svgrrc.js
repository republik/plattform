// See https://react-svgr.com/docs/options/

module.exports = {
  icon: true,
  typescript: true,
  expandProps: true,
  removeDimensions: false,
  replaceAttrValues: {
    "#000": "currentColor"
  },
  svgProps: {
    fill: "currentColor",
    stroke: "currentColor",
    style: "{props.style || { verticalAlign: 'middle' }}",
    width: '{props.width || props.size || "1em"}',
    height: '{props.height || props.size || "1em"}',
  },
  indexTemplate: require("./lib/icon-template.cjs"),
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

    ${variables.exports};
    `
  }
}
