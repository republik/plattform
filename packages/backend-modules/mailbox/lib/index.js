/**
 * Helper functions to walk mailbox backup directory, read files and check
 * messages.
 */

const klaw = require('klaw')
const fse = require('fs-extra')
const path = require('path')

const PATH = './data/mailbox'

const createFilesIterator = async () => {
  try {
    const stat = await fse.stat(PATH)

    if (!stat.isDirectory()) {
      throw new Error(`${PATH} is not a directory`)
    }

    return klaw(PATH)
  } catch (e) {
    console.warn(e.message)
  }
}

const maybeReadMessage = async (filePath) => {
  if (path.basename(filePath) === 'message.json') {
    const message = await fse.readJSON(filePath)
    const { headerLines, ...rest } = message

    return rest
  }

  return false
}

module.exports = {
  createFilesIterator,
  maybeReadMessage,
}
