import nextra from 'nextra'
// import { blah } from './theme/lib/blah.mjs'
import { rehypeComponentDemo } from './theme/lib/rehype-component-demo.mjs'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: { rehypePlugins: [rehypeComponentDemo] },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@project-r/styleguide', '@republik/ui-docs-demo'],
}

export default withNextra(nextConfig)
