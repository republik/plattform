#!/usr/bin/env node
const { promises: fs } = require('fs')
const htmlToText = require('html-to-text')
const he = require('he')
const path = require('path')
const Promise = require('bluebird')
const recursive = require('recursive-readdir')
const yargs = require('yargs')

const argv = yargs
  .options('templates', {
    alias: ['template', 't'],
    type: 'array',
  })
  .options('domain', {
    alias: 'd',
    type: 'string',
    default: 'republik.ch',
  }).argv

const filterNonHtml = (file) => path.extname(file) !== '.html'
const filterUnspecifiedTemplates = (file) =>
  !argv.templates.includes(path.basename(file, '.html'))

/**
 * Process an anchor
 *
 * @see https://github.com/html-to-text/node-html-to-text/blob/6.0.0/lib/formatter.js#L151-L193
 *
 * Customized to:
 * - append a space after a URL
 * - print href only whenver deemed best, see useHrefOnly()
 *
 */
const formatAnchorRepublik = (elem, walk, builder, formatOptions) => {
  function getHref() {
    if (formatOptions.ignoreHref) {
      return ''
    }
    if (!elem.attribs || !elem.attribs.href) {
      return ''
    }
    let href = elem.attribs.href.replace(/^mailto:/, '')
    if (formatOptions.noAnchorUrl && href[0] === '#') {
      return ''
    }
    href =
      formatOptions.baseUrl && href[0] === '/'
        ? formatOptions.baseUrl + href
        : href
    return he.decode(href, builder.options.decodeOptions)
  }
  const href = getHref()
  if (!href) {
    walk(elem.children, builder)
  } else {
    const text = elem.children
      .filter((elem) => elem.type === 'text' && !elem.children)
      .map((elem) =>
        elem.data
          .split(' ')
          .map((string) => string.trim())
          .filter(Boolean)
          .join(' '),
      )
      .join(' ')

    if (useHrefOnly(text, href)) {
      builder.addInline(href + ' ', true)
    } else if (formatOptions.hideLinkHrefIfSameAsText) {
      builder.addInline(text, true)
      builder.addInline(
        formatOptions.noLinkBrackets ? ' ' + href + ' ' : ' [' + href + ' ]',
        true,
      )
    }
  }
}

/**
 * Compares an achor text and href link. Returns true if href string
 * is deemd enough to represent anchor.
 *
 * @param {string} text
 * @param {string} href
 */
const useHrefOnly = (text, href) => {
  // Return true if text and href are the same
  if (text === href) {
    return true
  }

  const handlebarTag = /^{{.+}}$/

  /**
   * Returns true if text and href are handlebar tags
   *
   * Example:
   *   text: {{link_account}}
   *   href: {{link_account_something}}
   *
   */
  if (text.match(handlebarTag) && href.match(handlebarTag)) {
    return true
  }

  /**
   * Returns true if text contains domain and href is a handlebar tag
   *
   * Example:
   *   text: www.republik.ch/merci
   *   href: {{link_merci}}
   *
   */
  if (text.match(new RegExp(argv.domain)) && href.match(handlebarTag)) {
    return true
  }

  /**
   * Returns true if text is part of href
   *
   * Example:
   *   text: republik.ch/foobar
   *   href: https://www.republik.ch/foobar
   *
   */
  if (href.search(text) !== -1) {
    return true
  }

  return false
}

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
      htmlToText.fromString(html, {
        decodeOptions: {
          strict: false,
        },
        formatters: {
          formatAnchorRepublik,
        },
        tags: {
          img: {
            format: 'skip',
          },
          a: {
            format: 'formatAnchorRepublik',
            options: {
              noLinkBrackets: true,
              hideLinkHrefIfSameAsText: true,
            },
          },
        },
      }),
      { encoding: 'utf8', flag: 'w' },
    )
  })
}

run()
