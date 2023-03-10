import nextra from 'nextra'

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@project-r/styleguide', '@republik/ui-docs-demo'],
}

export default withNextra(nextConfig)
