import { beforeEach, vi } from 'vitest'
import { createServer } from '#/server/server.js'
import { authHeader } from '#/test-helpers/auth-helpers.js'

const callBackend = vi.fn()

vi.mock('#/server/common/helpers/backend-client.js', () => ({
  callBackend: (...args) => callBackend(...args)
}))

describe('#network controllers', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  beforeEach(() => {
    callBackend.mockReset()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should render the network page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/network',
      headers: { Authorization: authHeader }
    })

    expect(statusCode).toBe(200)
    expect(result).toEqual(expect.stringContaining('Network check |'))
  })

  describe('HTTP check', () => {
    test('Should show backend response details with total round-trip time', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: true,
          status: 200,
          statusText: 'OK',
          squidBlocked: false,
          headers: { 'content-type': 'text/plain' },
          body: 'hello from target',
          truncated: false
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'http', url: 'https://www.gov.uk' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(expect.stringContaining('Request completed in'))
      expect(result).toEqual(expect.stringContaining('200 OK'))
      expect(result).toEqual(expect.stringContaining('hello from target'))
    })

    test('Should show Squid blocked warning when squidBlocked is true', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: false,
          status: 307,
          statusText: 'Temporary Redirect',
          squidBlocked: true,
          headers: { location: 'http://squid-error' },
          body: '',
          truncated: false
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'http', url: 'https://not-in-acl.example.com' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(
        expect.stringContaining('Squid proxy blocked this request')
      )
      expect(result).toEqual(expect.stringContaining('cdp-tenant-config'))
    })

    test('Should return error summary when backend HTTP check fails', async () => {
      const error = new Error('Backend request failed')
      error.output = { statusCode: 502 }
      callBackend.mockRejectedValueOnce(error)

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'http', url: 'https://www.gov.uk' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(502)
      expect(result).toEqual(
        expect.stringContaining('HTTP check failed: Backend request failed')
      )
    })

    test('Should show backend timeout duration when HTTP check returns error payload', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: false,
          error: 'The operation was aborted',
          durationMs: 10001
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'http', url: 'https://www.gov.uk' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(expect.stringContaining('Request failed'))
      expect(result).toEqual(expect.stringContaining('10001 ms'))
    })
  })

  describe('DNS lookup', () => {
    test('Should show resolved addresses', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: true,
          hostname: 'www.gov.uk',
          ipv4: ['1.2.3.4'],
          ipv6: [],
          durationMs: 42
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'dns', hostname: 'www.gov.uk' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(expect.stringContaining('1.2.3.4'))
      expect(result).toEqual(expect.stringContaining('42 ms'))
    })

    test('Should show error when DNS lookup fails', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: false,
          hostname: 'doesnotexist.example',
          ipv4: [],
          ipv6: [],
          error: 'ENOTFOUND doesnotexist.example'
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'dns', hostname: 'doesnotexist.example' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(
        expect.stringContaining('ENOTFOUND doesnotexist.example')
      )
    })
  })

  describe('Port check', () => {
    test('Should show port open when reachable', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: true,
          host: 'api.os.uk',
          port: 443,
          reachable: true,
          durationMs: 42
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: { checkType: 'port', host: 'api.os.uk', port: '443' },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(expect.stringContaining('Port'))
      expect(result).toEqual(expect.stringContaining('443'))
      expect(result).toEqual(expect.stringContaining('open'))
      expect(result).toEqual(expect.stringContaining('42 ms'))
    })

    test('Should show port closed when not reachable', async () => {
      callBackend.mockResolvedValueOnce({
        json: {
          ok: false,
          host: 'closed.example.com',
          port: 9999,
          reachable: false,
          error: 'Connection refused'
        }
      })

      const { result, statusCode } = await server.inject({
        method: 'POST',
        url: '/network',
        payload: {
          checkType: 'port',
          host: 'closed.example.com',
          port: '9999'
        },
        headers: { Authorization: authHeader }
      })

      expect(statusCode).toBe(200)
      expect(result).toEqual(expect.stringContaining('not reachable'))
    })
  })
})
