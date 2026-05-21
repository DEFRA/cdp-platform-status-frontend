import { vi } from 'vitest'
import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'
import { authHeader } from '#/test-helpers/auth-helpers.js'
import { buildRedisClient } from '#/server/common/helpers/redis-client.js'

vi.mock('#/server/common/helpers/redis-client.js')

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/',
      headers: { Authorization: authHeader }
    })

    expect(result).toEqual(expect.stringContaining('Platform status |'))
    expect(statusCode).toBe(statusCodes.ok)
  })
})

describe('#apiRedisStatusController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return ok when Redis read/write succeeds', async () => {
    buildRedisClient.mockReturnValue({
      set: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue('ok'),
      del: vi.fn().mockResolvedValue(1),
      disconnect: vi.fn()
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/redis-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({
      checks: {
        redis: { status: 'ok', operations: { write: 'ok', read: 'ok' } }
      }
    })
  })

  test('Should return fail when Redis set throws', async () => {
    buildRedisClient.mockReturnValue({
      set: vi.fn().mockRejectedValue(new Error('Connection refused')),
      get: vi.fn(),
      del: vi.fn(),
      disconnect: vi.fn()
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/redis-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({
      checks: {
        redis: {
          status: 'fail',
          reason: 'Connection refused',
          operations: { write: 'fail', read: 'fail' }
        }
      }
    })
  })
})

describe('#apiBackendStatusController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return ok when backend health check succeeds', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ status: 'ok' }))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/backend-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({ checks: { backend: { status: 'ok' } } })
  })

  test('Should return fail when backend is unreachable', async () => {
    fetchMock.mockRejectOnce(new Error('fetch failed'))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/backend-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toMatchObject({
      checks: { backend: { status: 'fail' } }
    })
  })
})

describe('#apiMongoStatusController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return mongo check from backend', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ checks: { mongo: { status: 'ok' } } })
    )

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/mongo-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({ checks: { mongo: { status: 'ok' } } })
  })

  test('Should return fail with Backend unreachable when backend call throws', async () => {
    fetchMock.mockRejectOnce(new Error('fetch failed'))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/mongo-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({
      checks: { mongo: { status: 'fail', reason: 'Backend unreachable' } }
    })
  })

  test('Should return fail with Missing mongo check when key absent from backend response', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ checks: {} }))

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/mongo-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({
      checks: { mongo: { status: 'fail', reason: 'Missing mongo check' } }
    })
  })
})

describe('#backend-proxied status controllers', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test.each([
    ['/api/squid-status', 'squid'],
    ['/api/s3-status', 's3'],
    ['/api/sqs-status', 'sqs'],
    ['/api/sns-status', 'sns']
  ])('Should return %s check from backend', async (path, checkKey) => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ checks: { [checkKey]: { status: 'ok' } } })
    )

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: path
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({ checks: { [checkKey]: { status: 'ok' } } })
  })
})
