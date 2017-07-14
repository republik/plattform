import { css, StyleAttribute } from 'glamor'

const mergeClassNames = (
  classA: string | StyleAttribute,
  classB?: string | StyleAttribute
): string | StyleAttribute =>
  typeof classB === 'undefined'
    ? classA
    : typeof classA !== 'string' &&
      typeof classB !== 'string'
      ? css(classA, classB)
      : `${classA} ${classB}`

export default mergeClassNames
