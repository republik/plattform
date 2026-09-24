const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const { csvFormat } = require('d3-dsv')

// Fixed once per process, so every file written by a single script
// invocation shares the same timestamp (rather than drifting between the
// first and last write of a multi-file run).
const RUN_TIMESTAMP = dayjs().format('YYYY-MM-DD_HHmm')

const ensureDir = (outDir) => {
  fs.mkdirSync(outDir, { recursive: true })
}

const datedFilename = (filename) => `${filename}_${RUN_TIMESTAMP}`

const writeCsv = (records, outDir, filename) => {
  ensureDir(outDir)
  const filePath = path.join(outDir, `${datedFilename(filename)}.csv`)
  fs.writeFileSync(filePath, csvFormat(records))
  console.log(`wrote ${filePath}`)
}

const writeJson = (obj, outDir, filename) => {
  ensureDir(outDir)
  const filePath = path.join(outDir, `${datedFilename(filename)}.json`)
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
  console.log(`wrote ${filePath}`)
}

module.exports = { writeCsv, writeJson }
