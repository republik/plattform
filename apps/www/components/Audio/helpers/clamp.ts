/**
 * Clamp a value between a minimum and maximum
 * @param num input value
 * @param min minimum boundary
 * @param max maximum boundary
 */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max)
