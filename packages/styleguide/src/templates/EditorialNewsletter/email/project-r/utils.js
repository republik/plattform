export const matchProjectR = (format) =>
  (typeof format === 'string' &&
    format.includes('format-project-r-newsletter')) ||
  format?.repoId?.includes('format-project-r-newsletter')
