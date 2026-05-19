import { callBackend } from './backend-client.js'

const expectedAuthToken = Buffer.from('admin:test-password').toString('base64')

describe('#callBackend', () => {
  test('Should send Basic auth header', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}))

    await callBackend('http://backend/logs')

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe(`Basic ${expectedAuthToken}`)
  })

  test('Should throw Boom error with backend status code on failure', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401
    })

    await expect(callBackend('http://backend/logs')).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 401 }
    })
  })

  test('Should throw Boom 500 error when backend returns 500', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 })

    await expect(callBackend('http://backend/logs')).rejects.toMatchObject({
      isBoom: true,
      output: { statusCode: 500 }
    })
  })
})
