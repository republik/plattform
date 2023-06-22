#!/usr/bin/env node

// Usage
// cd ~/Code/styleguide
// cat ~/Articles/newsletter-editorial-x/article.md | scripts/renderNewsletter.js > ~/Desktop/email.html

require('dotenv').config()

const { renderEmail } = require('@republik/mdast-react-render')
const { parse } = require('@republik/remark-preset')
const rw = require('rw')
const editorialNewsletterSchema =
  require('../lib/templates/EditorialNewsletter/email').default()

const mdast = parse(rw.readFileSync('/dev/stdin', 'utf8'))

rw.writeFileSync(
  '/dev/stdout',
  renderEmail(mdast, editorialNewsletterSchema),
  'utf8',
)
