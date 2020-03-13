#!/usr/bin/env node
const { promises: fs } = require('fs')
const htmlToText = require('html-to-text')
const path = require('path')
const Promise = require('bluebird')
const recursive = require('recursive-readdir')
const yargs = require('yargs')

const argv = yargs
  .options('templates', {
    alias: ['template', 't'],
    type: 'array'
  })
  .argv

const filterNonHtml = file => path.extname(file) !== '.html'
const filterUnspecifiedTemplates = file => !argv.templates.includes(path.basename(file, '.html'))

const run = async () => {
  const files = await recursive(
    path.resolve(`${__dirname}/../templates`),
    [filterNonHtml, argv.templates && filterUnspecifiedTemplates].filter(Boolean)
  )

  await Promise.map(
    files,
    async file => {
      console.log(file)
      const html = await fs.readFile(file, 'utf8')
      await fs.writeFile(
        file.replace(/\.html$/gi, '.txt'),
        htmlToText
          .fromString(html, { ignoreImage: true })
          .replace(/^ /gm, '')
          .replace(/kontakt@republik\.ch \[kontakt@republik\.ch\]/gm, 'kontakt@republik.ch'),
        { encoding: 'utf8', flag: 'w' }
      )
    }
  )
}

run()
