import inert from '@hapi/inert'

import { home } from '../routes/home/index.js'
import { network } from '../routes/network/index.js'
import { logs } from '../routes/logs/index.js'
import { kill } from '../routes/kill/index.js'
import { health } from '../routes/health/index.js'
import { serveStaticFiles } from './serve-static-files.js'
import { config } from '#/config/config.js'
import { sts } from '#/server/routes/sts/index.js'

export const router = {
  plugin: {
    name: 'router',
    async register(server) {
      await server.register([inert])

      // Health-check route. Used by platform to check if service is running, do not remove!
      await server.register([health])

      // Application specific routes, add your own routes here
      await server.register([home, network, logs, kill])

      // temp endpoint for testing sts permissions
      await server.register([sts])

      // Static assets
      if (!config.get('isProduction') && !config.get('isTest')) {
        await (async () => {
          const createViteServer = (await import('vite')).createServer
          const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom'
          })

          // auth: false so CSS/JS are not blocked by the default Basic auth strategy
          server.route({
            method: '*',
            path: '/public/{param*}',
            options: {
              auth: false
            },
            handler: (request, h) => {
              return new Promise((resolve) => {
                vite.middlewares(request.raw.req, request.raw.res, () => {
                  resolve(h.response().code(404))
                })
              })
            }
          })
        })()
      } else {
        server.register(serveStaticFiles)
      }
    }
  }
}
