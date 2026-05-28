import { networkPageController, submitNetworkController } from './controller.js'

export const network = {
  plugin: {
    name: 'network',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/network',
          options: {
            auth: false
          },
          ...networkPageController
        },
        {
          method: 'POST',
          path: '/network',
          options: {
            auth: false
          },
          ...submitNetworkController
        }
      ])
    }
  }
}
