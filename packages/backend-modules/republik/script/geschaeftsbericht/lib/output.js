const fs = require('fs')
const path = require('path')
const { csvFormat } = require('d3-dsv')

const ensureDir = (outDir) => {
  fs.mkdirSync(outDir, { recursive: true })
}

const writeCsv = (records, outDir, filename) => {
  ensureDir(outDir)
  const filePath = path.join(outDir, `${filename}.csv`)
  fs.writeFileSync(filePath, csvFormat(records))
  console.log(`wrote ${filePath}`)
}

const writeJson = (obj, outDir, filename) => {
  ensureDir(outDir)
  const filePath = path.join(outDir, `${filename}.json`)
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
  console.log(`wrote ${filePath}`)
}

module.exports = { writeCsv, writeJson }
