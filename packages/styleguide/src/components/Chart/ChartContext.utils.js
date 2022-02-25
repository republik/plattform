import { isValuePresent, unsafeDatumFn } from './utils'

export const normalizeData = (x, xNormalizer) => (d) => ({
  datum: d,
  x: xNormalizer(d[x]),
  value: isValuePresent(d.value) ? +d.value : undefined,
})

export const getAnnotationsXValues = (annotations, xNormalizer) =>
  annotations
    ? annotations
        .reduce(
          (years, annotation) =>
            years.concat(annotation.x, annotation.x1, annotation.x2),
          [],
        )
        .filter(Boolean)
        .map(xNormalizer) // ensure format
    : []

export const categorizeData = (category) => (d) => {
  if (category) {
    const categorize = unsafeDatumFn(category)
    return {
      ...d,
      category: categorize(d.datum),
    }
  }
  return d
}
