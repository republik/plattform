import nextra from 'nextra'
// import { blah } from './theme/lib/blah.mjs'
import { rehypeComponentDemo } from './theme/lib/rehype-component-demo.mjs'
// import propsLoader from './theme/lib/props-loader.mjs'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: { rehypePlugins: [rehypeComponentDemo] },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@project-r/styleguide', '@republik/ui-docs-demo'],

  webpack(config) {
    config.module.rules = [
      // Use the props loader when the resource query props is applied
      // E.g. import someProps from "@republik/some-package?props"
      {
        test: /\.(js|jsx|ts|tsx)$/i,
        resourceQuery: /props/,
        use: './theme/lib/props-loader',
      },
      ...config.module.rules,
    ]
    return config
  },
}

export default withNextra(nextConfig)
