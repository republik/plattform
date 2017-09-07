export const cleanName = string => (
  string
    .trim()
    .split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
)

export const initials = string => (
  string
    .trim()
    .split(' ')
    .map(p => p[0])
    .join('')
)
