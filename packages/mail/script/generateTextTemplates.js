#!/usr/bin/env node
const { promises: fs } = require('fs')
const htmlToText = require('html-to-text')
const defaultFormat = require('html-to-text/lib/formatter')
const path = require('path')
const Promise = require('bluebird')
const recursive = require('recursive-readdir')
const yargs = require('yargs')

const argv = yargs.options('templates', {
  alias: ['template', 't'],
  type: 'array',
}).argv

const filterNonHtml = (file) => path.extname(file) !== '.html'
const filterUnspecifiedTemplates = (file) =>
  !argv.templates.includes(path.basename(file, '.html'))

const run = async () => {
  const files = await recursive(
    path.resolve(`${__dirname}/../templates`),
    [filterNonHtml, argv.templates && filterUnspecifiedTemplates].filter(
      Boolean,
    ),
  )

  await Promise.map(files, async (file) => {
    console.log(file)
    const html = await fs.readFile(file, 'utf8')
    await fs.writeFile(
      file.replace(/\.html$/gi, '.txt'),
      htmlToText
        .fromString(html, {
          ignoreImage: true,
          format: {
            anchor: (elem, fn, options) => {
              // based on https://github.com/werk85/node-html-to-text/blob/7894809a57e9066501b954dbd9c16fd34c3bcebf/lib/formatter.js#L148-L176
              // backed in noLinkBrackets: true and hideLinkHrefIfSameAsText: true
              // custom
              // - add extra space after urls
              // - add normalizeUrl for toHideSameLink
              function getHref() {
                if (!elem.attribs || !elem.attribs.href) {
                  return undefined
                }
                const href = elem.attribs.href.replace(/^mailto:/, '')
                if (options.noAnchorUrl && href[0] === '#') {
                  return undefined
                }
                return options.linkHrefBaseUrl && href[0] === '/'
                  ? options.linkHrefBaseUrl + href
                  : href
              }
              function getText() {
                return fn(elem.children, options) || ''
              }

              const storedCharCount = options.lineCharCount
              const text = getText()
              const href = getHref()
              function normalizeUrl(url = '') {
                return url
                  .replace(/\s+/g, '')
                  .replace(/^(https?:\/\/)?(www\.)?/, '')
                  .replace('{{frontend_base_url}}', 'republik.ch')
              }
              const toHideSameLink =
                href && normalizeUrl(href) === normalizeUrl(text)

              const result =
                toHideSameLink || !text ? href + ' ' : text + ' ' + href + ' '

              options.lineCharCount = storedCharCount
              return defaultFormat.text({ data: result, type: 'text' }, options)
            },
          },
        })
        .replace(/^ /gm, ''),
      { encoding: 'utf8', flag: 'w' },
    )
  }).then(() => {
    const custom = 'cf_comment_notification_new.txt signin.txt signin_code.txt newsletter_request_COVID19.txt'
      .split(' ')
      .filter((t) => !argv.templates || argv.templates.includes(t))
    if (custom.length) {
      console.log(
        'Make sure to restore plain text customizations: ' + custom.join(', '),
      )
    }
  })
}

run()
