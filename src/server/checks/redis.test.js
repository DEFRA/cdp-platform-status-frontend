import { vi } from 'vitest'
import { checkRedis } from './redis.js'
import { buildRedisClient } from '#/server/common/helpers/redis-client.js'

vi.mock('#/server/common/helpers/redis-client.js')

const request = { logger: { error: vi.fn() } }

function mockRedis(overrides = {}) {
  return {
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue('ok'),
    del: vi.fn().mockResolvedValue(1),
    disconnect: vi.fn(),
    ...overrides
  }
}

describe('#checkRedis', () => {
  test('Should return ok with write:ok and read:ok when all operations succeed', async () => {
    buildRedisClient.mockReturnValue(mockRedis())

    expect(await checkRedis(request)).toEqual({
      status: 'ok',
      operations: { write: 'ok', read: 'ok' }
    })
  })

  test('Should return fail with write:fail and read:fail when set throws', async () => {
    buildRedisClient.mockReturnValue(
      mockRedis({ set: vi.fn().mockRejectedValue(new Error('Connection refused')) })
    )

    expect(await checkRedis(request)).toEqual({
      status: 'fail',
      reason: 'Connection refused',
      operations: { write: 'fail', read: 'fail' }
    })
  })

  test('Should return fail with write:ok and read:fail on read/write mismatch', async () => {
    buildRedisClient.mockReturnValue(
      mockRedis({ get: vi.fn().mockResolvedValue('wrong-value') })
    )

    expect(await checkRedis(request)).toEqual({
      status: 'fail',
      reason: 'Read/write mismatch',
      operations: { write: 'ok', read: 'fail' }
    })
  })

  test('Should always call disconnect', async () => {
    const redis = mockRedis({
      set: vi.fn().mockRejectedValue(new Error('boom'))
    })
    buildRedisClient.mockReturnValue(redis)

    await checkRedis(request)

    expect(redis.disconnect).toHaveBeenCalled()
  })

  test('Should log error on failure', async () => {
    buildRedisClient.mockReturnValue(
      mockRedis({ set: vi.fn().mockRejectedValue(new Error('boom')) })
    )

    await checkRedis(request)

    expect(request.logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(Error) }),
      'Redis status check failed'
    )
  })
})
