import {
  homeController,
  apiRedisStatusController,
  apiBackendStatusController,
  apiMongoStatusController,
  apiSquidStatusController,
  apiS3StatusController,
  apiSqsStatusController,
  apiSnsStatusController
} from './controller.js'

/**
 * Sets up the routes used in the home page.
 * These routes are registered in src/server/router.js.
 */
export const home = {
  plugin: {
    name: 'home',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/',
          ...homeController
        },
        {
          method: 'GET',
          path: '/api/redis-status',
          options: {
            auth: false
          },
          ...apiRedisStatusController
        },
        {
          method: 'GET',
          path: '/api/backend-status',
          options: {
            auth: false
          },
          ...apiBackendStatusController
        },
        {
          method: 'GET',
          path: '/api/mongo-status',
          options: {
            auth: false
          },
          ...apiMongoStatusController
        },
        {
          method: 'GET',
          path: '/api/squid-status',
          options: {
            auth: false
          },
          ...apiSquidStatusController
        },
        {
          method: 'GET',
          path: '/api/s3-status',
          options: {
            auth: false
          },
          ...apiS3StatusController
        },
        {
          method: 'GET',
          path: '/api/sqs-status',
          options: {
            auth: false
          },
          ...apiSqsStatusController
        },
        {
          method: 'GET',
          path: '/api/sns-status',
          options: {
            auth: false
          },
          ...apiSnsStatusController
        }
      ])
    }
  }
}
