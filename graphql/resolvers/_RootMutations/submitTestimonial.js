const uuid = require('uuid/v4')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const keyCDN = require('../../../lib/keyCDN')
const convertImage = require('../../../lib/convertImage')
const uploadExoscale = require('../../../lib/uploadExoscale')
const renderUrl = require('../../../lib/renderUrl')
const sendMailTemplate = require('../../../lib/sendMailTemplate')

const FOLDER = 'testimonials'
const {IMAGE_SIZE_SMALL, IMAGE_SIZE_SHARE} = convertImage
const MAX_QUOTE_LENGTH = 140
const MAX_ROLE_LENGTH = 60

module.exports = async (_, args, {pgdb, req, t}) => {
  ensureSignedIn(req, t)

  // check if user is eligitable: has pledged and/or was vouchered a membership
  const hasPledges = !!(await pgdb.public.pledges.findFirst({userId: req.user.id}))
  if (!hasPledges && !(await pgdb.public.memberships.findFirst({userId: req.user.id}))) {
    console.error('not allowed submitTestimonial', args)
    throw new Error(t('api/testimonial/pledge/required'))
  }

  const { role, quote, image } = args
  const { ASSETS_BASE_URL, FRONTEND_BASE_URL, S3BUCKET } = process.env

  // check max lengths
  if (quote.trim().length > MAX_QUOTE_LENGTH) {
    throw new Error(t('testimonial/quote/tooLong'))
  }
  if (role.trim().length > MAX_ROLE_LENGTH) {
    throw new Error(t('testimonial/role/tooLong'))
  }

  let sendConfirmEmail = false
  let testimonial

  testimonial = await pgdb.public.testimonials.findOne({userId: req.user.id})
  if (!testimonial || !testimonial.published) { sendConfirmEmail = true }

  if (!testimonial && !image) {
    console.error('a new testimonials requires an image', args)
    throw new Error(t('api/testimonial/image/required'))
  }

  // block if testimonial has a video
  if (testimonial && testimonial.video) {
    console.error('testimonial has a video, change not allowed', args)
    throw new Error(t('api/unexpected'))
  }

  const firstMembership = await pgdb.public.memberships.findFirst({userId: req.user.id}, {orderBy: ['sequenceNumber asc']})
  let seqNumber
  if (firstMembership) { seqNumber = firstMembership.sequenceNumber }

  if (!image) {
    testimonial = await pgdb.public.testimonials.updateAndGetOne({id: testimonial.id}, {
      role,
      quote,
      published: true,
      sequenceNumber: testimonial.sequenceNumber || seqNumber
    }, {skipUndefined: true})
  } else { // new image
    const inputBuffer = Buffer.from(image, 'base64')
    const id = testimonial ? testimonial.id : uuid()

    const pathOriginal = `/${FOLDER}/${id}_original.jpeg`
    const pathSmall = `/${FOLDER}/${id}_${IMAGE_SIZE_SMALL}x${IMAGE_SIZE_SMALL}.jpeg`
    const pathShare = `/${FOLDER}/${id}_${IMAGE_SIZE_SHARE}x${IMAGE_SIZE_SHARE}.jpeg`

    await Promise.all([
      convertImage.toJPEG(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: pathOriginal,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        }),
      convertImage.toSmallBW(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: pathSmall,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        }),
      convertImage.toShare(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: pathShare,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        })
    ])

    if (testimonial) {
      await keyCDN.purgeUrls([pathOriginal, pathSmall, pathShare])
      testimonial = await pgdb.public.testimonials.updateAndGetOne({id: testimonial.id}, {
        role,
        quote,
        image: ASSETS_BASE_URL + pathSmall,
        updatedAt: new Date(),
        published: true,
        sequenceNumber: testimonial.sequenceNumber || seqNumber
      }, {skipUndefined: true})
    } else {
      testimonial = await pgdb.public.testimonials.insertAndGet({
        id,
        userId: req.user.id,
        role,
        quote,
        image: ASSETS_BASE_URL + pathSmall,
        published: true,
        sequenceNumber: seqNumber
      }, {skipUndefined: true})
    }
  }

  // generate sm picture (PNG!)
  try {
    const smImagePath = `/${FOLDER}/sm/${testimonial.id}_sm.png`
    await renderUrl(`${FRONTEND_BASE_URL}/community?share=${testimonial.id}`, 1200, 628)
      .then(async (data) => {
        return uploadExoscale({
          stream: data,
          path: smImagePath,
          mimeType: 'image/png',
          bucket: S3BUCKET
        }).then(async () => {
          await keyCDN.purgeUrls([smImagePath])
          return pgdb.public.testimonials.updateAndGetOne({id: testimonial.id}, {
            smImage: ASSETS_BASE_URL + smImagePath
          })
        })
      })
  } catch (e) {
    console.error('sm image render failed', args, e)
  }

  if (sendConfirmEmail) {
    await sendMailTemplate({
      to: req.user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/testimonial/mail/subject'),
      templateName: 'cf_community',
      globalMergeVars: [
        { name: 'NAME',
          content: req.user.firstName + ' ' + req.user.lastName
        }
      ]
    })
  }

  // augement with name
  testimonial.name = `${req.user.firstName} ${req.user.lastName}`

  return testimonial
}
