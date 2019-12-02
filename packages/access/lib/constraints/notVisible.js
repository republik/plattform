/**
 * Contraint generates an invisibility cloak once applied to a
 * specific campaign.
 *
 * @example: {"notVisible": {}}
 */

const isGrantable = () => true

const getMeta = () => ({
  visible: false,
  grantable: null,
  payload: {}
})

module.exports = {
  isGrantable,
  getMeta
}
