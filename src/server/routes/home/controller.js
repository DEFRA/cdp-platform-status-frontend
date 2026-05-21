import { checkRedis } from '#/server/checks/redis.js'
import {
  checkBackend,
  makeBackendCheckController
} from '#/server/checks/backend.js'

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
    return h.response({ checks: { backend: await checkBackend(request) } })
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
export const apiS3StatusController = makeBackendCheckController(
  '/status/s3',
  's3'
)
export const apiSqsStatusController = makeBackendCheckController(
  '/status/sqs',
  'sqs'
)
export const apiSnsStatusController = makeBackendCheckController(
  '/status/sns',
  'sns'
)
