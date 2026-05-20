import { config } from '#/config/config.js'
import { callBackend } from '#/server/common/helpers/backend-client.js'
import { buildRedisClient } from '#/server/common/helpers/redis-client.js'

const TIMEOUT_MS = 10_000

function normalizeError(error) {
  return error instanceof Error ? error.message : String(error)
}

async function checkRedis(request) {
  const redisClient = buildRedisClient(config.get('redis'))
  try {
    await Promise.race([
      redisClient.ping(),
      new Promise((_resolve, reject) =>
        setTimeout(
          () => reject(new Error(`Timed out after ${TIMEOUT_MS}ms`)),
          TIMEOUT_MS
        )
      )
    ])
    return { status: 'ok' }
  } catch (error) {
    request.logger.error({ err: error }, 'Redis status check failed')
    return { status: 'fail', reason: normalizeError(error) }
  } finally {
    redisClient.disconnect()
  }
}

async function fetchBackendCheck(request, backendPath) {
  try {
    const { json } = await callBackend(
      `${config.get('backendUrl')}${backendPath}`
    )
    return json.checks ?? {}
  } catch (error) {
    request.logger.error(
      { err: error, backendPath },
      'Backend status check failed'
    )
    return null
  }
}

function makeBackendCheckController(backendPath, checkKey) {
  return {
    async handler(request, h) {
      const checks = await fetchBackendCheck(request, backendPath)
      return h.response({
        checks: {
          [checkKey]: checks
            ? (checks[checkKey] ?? {
                status: 'fail',
                reason: `Missing ${checkKey} check`
              })
            : { status: 'fail', reason: 'Backend unreachable' }
        }
      })
    }
  }
}

export const homeController = {
  handler(_request, h) {
    return h.view('home/index', {
      pageTitle: 'Platform status',
      heading: 'Platform status dashboard'
    })
  }
}

export const apiRedisStatusController = {
  async handler(request, h) {
    return h.response({ checks: { redis: await checkRedis(request) } })
  }
}

export const apiBackendStatusController = {
  async handler(request, h) {
    try {
      await callBackend(`${config.get('backendUrl')}/health`)
      return h.response({ checks: { backend: { status: 'ok' } } })
    } catch (error) {
      request.logger.error({ err: error }, 'Backend connectivity check failed')
      return h.response({
        checks: { backend: { status: 'fail', reason: normalizeError(error) } }
      })
    }
  }
}

export const apiMongoStatusController = makeBackendCheckController(
  '/status/mongo',
  'mongo'
)
export const apiSquidStatusController = makeBackendCheckController(
  '/status/squid',
  'squid'
)
