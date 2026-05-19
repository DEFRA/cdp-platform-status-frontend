export function buildNavigation(request) {
  return [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    },
    {
      text: 'Large logs',
      href: '/logs',
      current: request?.path?.startsWith('/logs')
    }
  ]
}
