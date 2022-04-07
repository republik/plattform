export function creditsToString(credits) {
  if (!credits) return null

  let out = []
  let curr = credits

  if (Array.isArray(curr) && curr.length > 0) {
    curr.forEach((obj) => out.push(creditsToString(obj)))
  } else if (typeof curr === 'object') {
    if (curr.type === 'text') {
      out.push(curr.value)
    }
    if ('children' in curr) {
      curr.children.forEach((obj) => out.push(creditsToString(obj)))
    }
  }
  return out.join('')
}
