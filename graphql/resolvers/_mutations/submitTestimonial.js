// SM image and sendMail are copied over from crowdfunding,
// but currently disabled.

const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
// const renderUrl = require('../../../lib/renderUrl')
// const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

const MAX_QUOTE_LENGTH = 140
const MAX_ROLE_LENGTH = 60

module.exports = async (_, args, {pgdb, req, user: me, t}) => {
  ensureSignedIn(req)

  // check if user is eligitable: has pledged and/or was vouchered a membership
  const hasPledges = !!(await pgdb.public.pledges.findFirst({userId: me.id}))
  if (!hasPledges && !(await pgdb.public.memberships.findFirst({userId: me.id}))) {
    console.error('not allowed submitTestimonial', args)
    throw new Error(t('api/testimonial/pledge/required'))
  }

  const { role, quote } = args

  // check max lengths
  if (quote.trim().length > MAX_QUOTE_LENGTH) {
    throw new Error(t('testimonial/quote/tooLong'))
  }
  if (role.trim().length > MAX_ROLE_LENGTH) {
    throw new Error(t('testimonial/role/tooLong'))
  }

  // let sendConfirmEmail = false
  let testimonial

  testimonial = await pgdb.public.testimonials.findOne({userId: me.id})
  // if (!testimonial || !testimonial.published) { sendConfirmEmail = true }

  if (!me._raw.portraitUrl) {
    console.error('a testimonial requires a portrait', args)
    throw new Error(t('api/testimonial/portrait/required'))
  }

  // block if testimonial has a video
  if (testimonial && testimonial.video) {
    console.error('testimonial has a video, change not allowed', args)
    throw new Error(t('api/unexpected'))
  }

  const firstMembership = await pgdb.public.memberships.findFirst({userId: me.id}, {orderBy: ['sequenceNumber asc']})
  let seqNumber
  if (firstMembership) { seqNumber = firstMembership.sequenceNumber }

  if (testimonial) {
    testimonial = await pgdb.public.testimonials.updateAndGetOne({id: testimonial.id}, {
      role,
      quote,
      updatedAt: new Date(),
      published: true,
      sequenceNumber: testimonial.sequenceNumber || seqNumber
    }, {skipUndefined: true})
  } else {
    testimonial = await pgdb.public.testimonials.insertAndGet({
      userId: me.id,
      role,
      quote,
      published: true,
      sequenceNumber: seqNumber
    }, {skipUndefined: true})
  }

  // generate sm picture (PNG!)
  /* try {
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
  } */

  /* if (sendConfirmEmail) {
    await sendMailTemplate({
      to: me.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/testimonial/mail/subject'),
      templateName: 'cf_community',
      globalMergeVars: [
        { name: 'NAME',
          content: me.firstName + ' ' + me.lastName
        }
      ]
    })
  } */

  // augement with name
  testimonial.name = me.name
  testimonial.image = me._raw.portraitUrl

  return testimonial
}
