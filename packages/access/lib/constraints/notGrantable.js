/**
 * Dummy constraint. Contraint always fail.
 *
 * @example: {"notGrantable": {}}
 */

const isGrantable = () => false

const getMeta = () => ({
  visible: true,
  grantable: false,
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
