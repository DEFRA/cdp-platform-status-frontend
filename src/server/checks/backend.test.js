import { vi } from 'vitest'
import { checkBackend } from './backend.js'

const request = { logger: { error: vi.fn() } }

describe('#checkBackend', () => {
  test('Should return ok when backend health check succeeds', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'ok' }))

    expect(await checkBackend(request)).toEqual({ status: 'ok' })
  })

  test('Should return fail when backend is unreachable', async () => {
    fetchMock.mockRejectOnce(new Error('fetch failed'))

    expect(await checkBackend(request)).toMatchObject({
      status: 'fail',
      reason: expect.any(String)
    })
  })

  test('Should log error when backend is unreachable', async () => {
    fetchMock.mockRejectOnce(new Error('fetch failed'))

    await checkBackend(request)

    expect(request.logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Backend connectivity check failed'
    )
  })
})
