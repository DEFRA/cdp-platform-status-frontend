import {
  homeController,
  apiRedisStatusController,
  apiBackendStatusController,
  apiMongoStatusController,
  apiSquidStatusController
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
          options: {
            auth: false
          },
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
        }
      ])
    }
  }
}
