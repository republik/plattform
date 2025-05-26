export const sBreakPoint = 375
export const mBreakPoint = 768
export const lBreakPoint = 1025

export const onlyS = `@media only screen and (max-width: ${mBreakPoint - 1}px)`
export const mUp = `@media only screen and (min-width: ${mBreakPoint}px)`
export const mUpAndPrint = `@media only screen and (min-width: ${mBreakPoint}px), print`
export const mDown = `@media only screen and (min-width: ${mBreakPoint - 1}px)`
export const lUp = `@media only screen and (min-width: ${lBreakPoint}px)`
// screen size below iPhone 8
export const sDown = `@media only screen and (max-width: ${sBreakPoint - 1}px)`
