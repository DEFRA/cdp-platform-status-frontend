import { killPageController, triggerKillController } from './controller.js'

export const kill = {
  plugin: {
    name: 'kill',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/kill',
          ...killPageController
        },
        {
          method: 'POST',
          path: '/kill',
          ...triggerKillController
        }
      ])
    }
  }
}
