export const parseJSONObject = json => {
  let object
  try {
    object = JSON.parse(json)
  } catch (error) {}
  // handle null and undefined
  // - remember that typeof null === 'object'
  if (!object) {
    object = {}
  }
  return object
}
