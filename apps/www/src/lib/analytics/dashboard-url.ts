export const getAnalyticsDashboardUrl = (pagePath: string) => {
  try {
    const dashboardUrl = new URL(
      process.env.NEXT_PUBLIC_PLAUSIBLE_DASHBOARD_URL,
    )

    dashboardUrl.searchParams.set('filters', `((is,page,(${pagePath})))`)
    dashboardUrl.searchParams.set('period', '30d')

    return dashboardUrl.toString()
  } catch {
    return undefined
  }
}
