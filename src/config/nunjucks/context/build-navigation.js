export const navItems = [
  { text: 'Home', href: '/' },
  { text: 'Large logs', href: '/logs' },
  { text: 'Kill switch', href: '/kill' }
]

export function buildNavigation(request) {
  const path = request?.path ?? ''
  return navItems.map((item) => ({
    ...item,
    current: path === item.href || (item.href !== '/' && path.startsWith(item.href))
  }))
}
