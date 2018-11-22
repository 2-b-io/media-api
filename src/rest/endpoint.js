import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from 'http-status-codes'
import serializeError from 'serialize-error'

const normalizeHttpHeaders = (headers) => Object.entries(headers).reduce(
  (headers, [ name, value ]) => ({
    ...headers,
    [ name.toLocaleLowerCase() ]: value
  }),
  {}
)

const parseAuthorizationHeader = (value) => {
  const [ type, params ] = value.split(' ')

  return {
    type,
    ...(
      params.split(',').reduce(
        (map, pair) => {
          const [ name, value ] = pair.split('=')

          return {
            ...map,
            [ name ]: value
          }
        }, {}
      )
    )
  }
}

const authorize = (req) => {
  const { authorization } = normalizeHttpHeaders(req.headers)

  if (!authorization) {
    throw UNAUTHORIZED
  }

  const { type, app, account } = parseAuthorizationHeader(authorization)

  if (type !== 'MEDIA_CDN') {
    throw UNAUTHORIZED
  }

  // TODO: verify app & account

  return {
    app,
    account
  }
}

export default (handler) => async (req, context) => {
  // Make sure to add this so you can re-use `connnection` between function calls.
  // See https://www.mongodb.com/blog/post/serverless-development-with-nodejs-aws-lambda-mongodb-atlas
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const session = authorize(req)

    const { statusCode, resource } = await handler(req, session)

    return {
      statusCode,
      body: resource ?
        JSON.stringify(resource) :
        null
    }
  } catch (e) {
    if (e === UNAUTHORIZED) {
      return {
        statusCode: UNAUTHORIZED
      }
    }

    return {
      statusCode: INTERNAL_SERVER_ERROR,
      body: JSON.stringify({
        reason: serializeError(e)
      })
    }
  }
}
