import { generateLogsController, logsPageController } from './controller.js'

export const logs = {
  plugin: {
    name: 'logs',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/logs',
          ...logsPageController
        },
        {
          method: 'POST',
          path: '/logs',
          ...generateLogsController
        }
      ])
    }
  }
}
