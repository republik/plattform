#!/usr/bin/env node
// splits a front repo into two, based on a date
//
// usage: place the magazine repo folder (containing article.md and images folder)
// next to this script and run it

const Promise = require('bluebird')
const { promises: fs } = require('fs')
const path = require('path')
const MDAST = require('@orbiting/remark-preset')
const moment = require('moment')
const { max } = require('d3-array')
const visit = require('unist-util-visit')

const { argv } = process

const dateFormat = 'DD.MM.YYYY'
const dateFormatFilesafe = 'YYYY-MM-DD'
const getDateRegex = () => new RegExp(/\d\d\.\d\d\.\d\d\d\d/, 'gm')

const splitDate = moment(argv[2])
if (!argv[2] || !splitDate.isValid()) {
  throw new Error('first argument must be a valid date to split teasers at')
}

const repoDir = path.join(__dirname, 'magazine')
const getNewRepoDir = (key) =>
  path.join(__dirname, `magazine-${key}-${splitDate.format(dateFormatFilesafe)}`)

console.log(`Trying to split front at ${splitDate.format(dateFormat)}...`)

Promise.resolve().then(async () => {
  const articleRaw = await fs.readFile(
    path.join(repoDir, 'article.md')
  )

  const mdast = MDAST.parse(articleRaw)

  const newRootChildren = {
    before: [],
    after: []
  }

  // split nodes into before and after
  let isAfter = false
  let firstDateAfter
  mdast.children
    .reverse()
    .forEach(rootChild => {
      const nodes = rootChild.identifier === 'TEASERGROUP'
        ? rootChild.children
        : [rootChild]

      const nodesString = JSON.stringify(nodes)
      const regexResult = getDateRegex().exec(nodesString)
      const dateString = max(regexResult || [])

      const date = dateString && moment(dateString, dateFormat)
      const key = date
        ? (date.isBefore(splitDate) ? 'before' : 'after')
        : (isAfter ? 'after' : 'before')

      if (key === 'before') {
        if (isAfter) {
          console.warn('child with date before split date encountered after children with date after')
        }
        newRootChildren.before.push(rootChild)
      } else {
        if (!isAfter) {
          firstDateAfter = date
        }
        isAfter = true
        newRootChildren.after.push(rootChild)
      }
    })

  console.log(`first date after split: ${firstDateAfter.format(dateFormat)}`)

  // put content into two folders
  await Promise.each(
    ['before', 'after'],
    async (key) => {
      const newRepoDir = getNewRepoDir(key)
      await fs.mkdir(newRepoDir, { recursive: true })
      await fs.mkdir(path.join(newRepoDir, 'images'), { recursive: true })

      const newMdast = {
        ...mdast,
        children: newRootChildren[key]
          .reverse()
      }

      // extract images
      const imagePaths = []
      visit(newMdast, 'image', (node) => {
        const { url } = node
        const imagePath = url && url.split('?')[0]
        if (!url || !imagePath) {
          console.warn(`encountered image without url in ${key}`, node)
          return
        }
        imagePaths.push(imagePath)
      })

      // copy images
      await Promise.map(
        imagePaths,
        (imagePath) =>
          fs.copyFile(
            path.join(repoDir, imagePath),
            path.join(newRepoDir, imagePath)
          )
            .catch(error => {
              console.error('copying image failed', { error, imagePath })
            })
      )

      // write article.md
      const mdastString = MDAST.stringify(newMdast)
      await fs.writeFile(
        path.join(newRepoDir, 'article.md'),
        mdastString
      )
    }
  )

  console.log(`finished`)
}).then(() => {
  process.exit()
}).catch(e => {
  console.log(e)
  process.exit(1)
})
