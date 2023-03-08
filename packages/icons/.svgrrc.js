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
    style: "{props.style || { verticalAlign: 'middle' }}"
  },
  indexTemplate: require("./lib/icon-template.cjs")
}
