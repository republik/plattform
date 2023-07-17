import createArticleSchema from '../Article'

const createAufDenPunktSchema = ({
  series = false,
  hasEmailTemplate = false,
  scrollyComponents = true,
  ...args
} = {}) => {
  return createArticleSchema({
    repoPrefix: 'adp-',
    hasEmailTemplate,
    series,
    scrollyComponents,
    ...args,
  })
}

export default createAufDenPunktSchema
