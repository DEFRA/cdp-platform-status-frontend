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

  test('Should return ok when Redis ping succeeds', async () => {
    buildRedisClient.mockReturnValue({
      ping: vi.fn().mockResolvedValue('PONG'),
      disconnect: vi.fn()
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/redis-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({ checks: { redis: { status: 'ok' } } })
  })

  test('Should return fail when Redis ping throws', async () => {
    buildRedisClient.mockReturnValue({
      ping: vi.fn().mockRejectedValue(new Error('Connection refused')),
      disconnect: vi.fn()
    })

    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/api/redis-status'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toEqual({
      checks: { redis: { status: 'fail', reason: 'Connection refused' } }
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
