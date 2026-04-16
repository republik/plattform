export default function formatCredits(credits) {
  return credits.map((c, i) => {
    if (c.type === 'text') {
      const value = c.value.replace(
        i === 0
          ? /(,\s|^)\d{1,2}\.\d{1,2}\.\d{4},?\s?/g
          : /(,\s|^)\d{1,2}\.\d{1,2}\.\d{4}\s?/g,
        '',
      )
      return {
        ...c,
        value,
      }
    } else {
      return c
    }
  });
}
