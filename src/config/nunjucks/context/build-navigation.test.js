import { buildNavigation } from './build-navigation.js'

const navItems = [
  { text: 'Home', href: '/' },
  { text: 'Large logs', href: '/logs' },
  { text: 'Kill switch', href: '/kill' }
]

function expectedNav(currentHref) {
  return navItems.map((item) => ({
    ...item,
    current: item.href === currentHref
  }))
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(buildNavigation({ path: '/non-existent-path' })).toEqual(
      expectedNav(null)
    )
  })

  test.each([
    ['Home', '/'],
    ['Large logs', '/logs'],
    ['Kill switch', '/kill']
  ])('Should highlight %s nav item when on %s page', (_, path) => {
    expect(buildNavigation({ path })).toEqual(expectedNav(path))
  })
})
