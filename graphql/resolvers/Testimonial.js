const { getImageUrl } = require('../../lib/convertImage')

module.exports = {
  image: (testimonial, args) => getImageUrl(testimonial.image, args)
}
