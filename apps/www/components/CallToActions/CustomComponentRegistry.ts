import dynamic from 'next/dynamic'
import { isDev } from '../../lib/constants'
import { CTAComponentBaseProps } from './CustomComponentBase'

// This is a registry of the available custom CTA components.
// The components are dynamically imported to avoid bloating the main bundle.
const customComponentsRegistry = {
  // ==== Below are examples of how to add custom components ====
  // futureCampaign: dynamic(
  //   () => import('./customComponents/FutureCampaignBanner'),
  //   {
  //     ssr: false,
  //   },
  // ),
  datenschutzUpdate: dynamic(
    () => import('./customComponents/DatenschutzBanner'),
    {
      ssr: false,
    },
  ),
}

/**
 * Retrieve a custom component by key
 */
export function getCustomComponent(
  key: string,
): React.ComponentType<CTAComponentBaseProps> | undefined {
  const customComponent = customComponentsRegistry[key]
  if (!customComponent) {
    if (isDev) {
      console.error(`Custom component ${key} not found`)
    } else {
      console.warn(`Custom component ${key} not found`)
    }
  }

  return customComponent
}
