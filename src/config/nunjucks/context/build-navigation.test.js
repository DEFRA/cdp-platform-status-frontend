import { buildNavigation } from './build-navigation.js'

function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'Large logs',
        href: '/logs'
      },
      {
        current: false,
        text: 'Kill switch',
        href: '/kill'
      }
    ])
  })

  test('Should provide expected highlighted navigation details', () => {
    expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        current: true,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'Large logs',
        href: '/logs'
      },
      {
        current: false,
        text: 'Kill switch',
        href: '/kill'
      }
    ])
  })

  test('Should highlight Large logs nav item when on logs page', () => {
    expect(buildNavigation(mockRequest({ path: '/logs' }))).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: true,
        text: 'Large logs',
        href: '/logs'
      },
      {
        current: false,
        text: 'Kill switch',
        href: '/kill'
      }
    ])
  })

  test('Should highlight Kill switch nav item when on kill page', () => {
    expect(buildNavigation(mockRequest({ path: '/kill' }))).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'Large logs',
        href: '/logs'
      },
      {
        current: true,
        text: 'Kill switch',
        href: '/kill'
      }
    ])
  })
})
