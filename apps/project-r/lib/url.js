export const removeQuery = (url = '') => url.split('?')[0]
export const cleanAsPath = asPath => removeQuery(asPath).split('#')[0]
