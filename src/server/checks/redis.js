import { config } from '#/config/config.js'
import { buildRedisClient } from '#/server/common/helpers/redis-client.js'
import { normalizeError, runWithTimeout } from '#/server/checks/helpers.js'

export async function checkRedis(request) {
  const redisClient = buildRedisClient(config.get('redis'))
  const testKey = `cdp-platform-status:health-check:${Date.now()}`
  const testValue = 'ok'
  const ops = { write: 'fail', read: 'fail' }
  try {
    await runWithTimeout(async () => {
      await redisClient.set(testKey, testValue, 'EX', 10)
      ops.write = 'ok'

      const value = await redisClient.get(testKey)
      await redisClient.del(testKey)

      if (value !== testValue) {
        throw new Error('Read/write mismatch')
      }
      ops.read = 'ok'
    })
    return { status: 'ok', operations: ops }
  } catch (error) {
    request.logger.error({ err: error }, 'Redis status check failed')
    return { status: 'fail', reason: normalizeError(error), operations: ops }
  } finally {
    redisClient.disconnect()
  }
}
