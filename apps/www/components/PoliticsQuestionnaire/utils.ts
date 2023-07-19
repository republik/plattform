export const leftJoin = (objArr1, objArr2, key) =>
  objArr1.map((anObj1) => ({
    ...objArr2.find((anObj2) => anObj1[key] === anObj2[key]),
    ...anObj1,
  }))
