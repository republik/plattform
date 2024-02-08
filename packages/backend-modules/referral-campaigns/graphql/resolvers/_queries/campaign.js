/** @typedef {import('@orbiting/backend-modules-types').GraphqlContext} GraphqlContext */

/**
 * Find resolve campaign by slug
 * @param {object} _
 * @param {{ slug: string }} args
 * @param {GraphqlContext} ctx
 * @returns {Promise<Object?>}
 */
module.exports = async (_, { slug }, ctx) => {
  const campaign = await ctx.pgdb.public.campaigns.findOne({ slug: slug })

  return campaign
}
