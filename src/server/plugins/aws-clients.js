import { STSClient } from '@aws-sdk/client-sts'
import { config } from '#/config/config.js'

export const awsClients = {
  plugin: {
    name: 'aws-clients',
    version: '1.0.0',
    register(server) {
      const region = config.get('aws.region')

      const sts = new STSClient({ region })

      server.decorate('server', 'sts', sts)
      server.decorate('request', 'sts', () => sts, { apply: true })

      server.events.on('stop', () => {
        server.logger.info('Closing AWS SDK clients')
        sts.destroy()
      })
    }
  }
}
