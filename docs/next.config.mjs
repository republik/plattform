import nextra from 'nextra'
// import { blah } from './theme/lib/blah.mjs'
import { rehypeComponentDemo } from './lib/rehype/rehype-component-demo.mjs'
import { withDocs } from './lib/with-docs.mjs'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: { rehypePlugins: [rehypeComponentDemo] },
  latex: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@republik/ui-docs-demo'],
}

export default withDocs(withNextra(nextConfig))
