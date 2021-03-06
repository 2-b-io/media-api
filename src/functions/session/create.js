import { CREATED, FORBIDDEN } from 'http-status-codes'
import joi from 'joi'

import resource from 'rest/resource'
import accountService from 'services/account'
import authorize from 'middlewares/authorize'
import config from 'infrastructure/config'

const SCHEMA = joi.object().keys({
  email: joi.string().email().required(),
  password: joi.string().required()
})

export default authorize([
  config.apps.WEBAPP,
  config.apps.JOB_LOOP,
  config.apps.CDN,
  config.apps.S3_SYNC,
  config.apps.ADMINAPP,
])(resource('ACCOUNT')(
  async (req) => {
    const body = JSON.parse(req.body)
    const { email, password } = await joi.validate(body, SCHEMA)

    const accounts = await accountService.list({ email })

    if (accounts.length !== 1 || !accounts[ 0 ].comparePassword(password)) {
      throw {
        statusCode: FORBIDDEN
      }
    }

    return {
      statusCode: CREATED,
      resource: accounts[ 0 ]
    }
  }
))
