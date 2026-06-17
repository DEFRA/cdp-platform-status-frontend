import { killPageController, triggerKillController } from './controller.js'

export const kill = {
  plugin: {
    name: 'kill',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/kill',
          options: {
            auth: {
              mode: 'required'
            }
          },
          ...killPageController
        },
        {
          method: 'POST',
          path: '/kill',
          options: {
            auth: {
              mode: 'required'
            }
          },
          ...triggerKillController
        }
      ])
    }
  }
}
