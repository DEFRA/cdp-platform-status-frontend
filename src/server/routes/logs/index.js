import { generateLogsController, logsPageController } from './controller.js'

export const logs = {
  plugin: {
    name: 'logs',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/logs',
          options: {
            auth: {
              mode: 'required'
            }
          },
          ...logsPageController
        },
        {
          method: 'POST',
          path: '/logs',
          options: {
            auth: {
              mode: 'required'
            }
          },
          ...generateLogsController
        }
      ])
    }
  }
}
