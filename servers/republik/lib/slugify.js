const slugify = require('slugify')

slugify.extend({
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue'
})

module.exports = (text) => slugify(text.toLowerCase())
