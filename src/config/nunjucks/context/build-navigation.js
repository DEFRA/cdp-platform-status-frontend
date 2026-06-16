export const navItems = [
  { text: 'Home', href: '/' },
  { text: 'Network check', href: '/network' },
  { text: 'Large logs', href: '/logs' },
  { text: 'Kill switch', href: '/kill' }
]

const adminOnlyHrefs = new Set(['/logs', '/kill'])

export function buildNavigation(request) {
  const path = request?.path ?? ''
  let isAdmin = false
  try {
    isAdmin = request?.yar?.get?.('isAdmin') ?? false
  } catch {
    // Yar session may be uninitialised (e.g. unknown route before session middleware runs)
  }

  return navItems
    .filter((item) => isAdmin || !adminOnlyHrefs.has(item.href))
    .map((item) => ({
      ...item,
      current:
        path === item.href || (item.href !== '/' && path.startsWith(item.href))
    }))
}
