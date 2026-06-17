export const admin = {
  plugin: {
    name: 'admin',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/login',
          options: {
            auth: {
              mode: 'required'
            }
          },
          handler: (request, h) => {
            request.yar.set('isAdmin', true)
            return h.redirect('/')
          }
        }
      ])
    }
  }
}
