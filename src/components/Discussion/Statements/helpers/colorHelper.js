import { stripTag } from './tagHelper'

export function getUniqueColorTagName(tagName) {
  return `tag-${stripTag(tagName)}-color`
}
