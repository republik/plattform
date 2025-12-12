// This package will allway's return false and only
// exists because access grants that have been issued
// in the past still exist in the database and look for
// this contrainte module

async function isGrantable(_args, _context) {
  return false
}

async function getMeta(_args, _context) {
  return {
    visible: false,
    grantable: false,
    payload: {},
  }
}

module.exports = {
  isGrantable,
  getMeta,
}
