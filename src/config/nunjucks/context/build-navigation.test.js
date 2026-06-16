import { buildNavigation, navItems } from './build-navigation.js'

function expectedNav(currentHref, isAdmin) {
  const visibleItems = navItems.filter((item) =>
    isAdmin ? true : !['/logs', '/kill'].includes(item.href)
  )

  return visibleItems.map((item) => ({
    ...item,
    current: item.href === currentHref
  }))
}

function request(path, isAdmin = false) {
  return {
    path,
    yar: {
      get: (key) => (key === 'isAdmin' ? isAdmin : undefined)
    }
  }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details for non-admin users', () => {
    expect(buildNavigation(request('/non-existent-path'))).toEqual(
      expectedNav(null, false)
    )
  })

  test('Should provide expected navigation details for admin users', () => {
    expect(buildNavigation(request('/non-existent-path', true))).toEqual(
      expectedNav(null, true)
    )
  })

  test.each([
    ['Home', '/'],
    ['Network check', '/network']
  ])(
    'Should highlight %s nav item when non-admin user is on %s page',
    (_, path) => {
      expect(buildNavigation(request(path))).toEqual(expectedNav(path, false))
    }
  )

  test.each([
    ['Home', '/'],
    ['Network check', '/network'],
    ['Large logs', '/logs'],
    ['Kill switch', '/kill']
  ])('Should highlight %s nav item when on %s page', (_, path) => {
    expect(buildNavigation(request(path, true))).toEqual(
      expectedNav(path, true)
    )
  })
})
