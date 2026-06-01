import { tokenController } from '#/server/routes/sts/controller.js'

export const sts = {
  plugin: {
    name: 'sts',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/sts',
          ...tokenController
        }
      ])
    }
  }
}
