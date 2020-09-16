Usage example with next:

```
<ColorContextProvider value={forceDarkMode && colors.negative}>
  <Head>
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${generateCSSColorDefinitions(colors)} } @media (prefers-color-scheme: dark) { :root { ${generateCSSColorDefinitions(colors.negative)} } }`
      }}
    />
  </Head>
</ColorContextProvider>
```

One could add something like this in their frame component. The frame could force dark mode by setting `forceDarkMode` to true. Or leave it to auto detection.
