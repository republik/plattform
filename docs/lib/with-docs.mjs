/** @typedef {import("next").NextConfig} NextConfig */

/**
 * Super duper enhancement
 *
 * @param {NextConfig} nextConfig
 * @returns {NextConfig}
 */
export function withDocs(nextConfig = {}) {
  return {
    ...nextConfig,

    webpack(config, options) {
      config.module.rules = [
        // Use the props loader when the resource query props is applied
        // E.g. import someProps from "@republik/some-package?props"
        {
          test: /\.(js|jsx|ts|tsx)$/i,
          resourceQuery: /props/,
          use: new URL('./webpack/props-loader', import.meta.url).pathname,
        },
        // ... but make sure that no other rules are applied!
        ...config.module.rules.map((rule) => {
          return rule.resourceQuery
            ? rule
            : { ...rule, resourceQuery: { not: [/props/] } }
        }),
      ]

      return nextConfig.webpack?.(config, options) ?? config
    },
  }
}
