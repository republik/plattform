/**
 * Recursively flatten an array into a single level
 * @param arr
 */
function flattenArray(arr: unknown): unknown[] {
  if (!Array.isArray(arr)) return [arr]

  const out = []
  for (let i = 0; i < arr.length; i += 1) {
    if (Array.isArray(arr[i])) {
      out.push(...flattenArray(arr[i]))
    } else {
      out.push(arr[i])
    }
  }

  return out
}

module.exports = flattenArray
