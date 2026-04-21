import { css } from '@republik/theme/css'

const mergeClassNames = (classA, classB) =>
  typeof classB === 'undefined'
    ? classA
    : typeof classA !== 'string' && typeof classB !== 'string'
    ? css(classA, classB)
    : `${classA} ${classB}`

export default mergeClassNames
