import uuid from 'uuid'

import config from 'infrastructure/config'
import accountService from 'services/account'
import jobService from 'services/job'
import resetTokenService from 'services/reset-token'

const invite = async (emails, inviterName, inviterEmail, message) => {
  await Promise.all(
    emails.map(async (email) => {
      const { token } = await resetTokenService.create({ email })

      return await jobService.create({
        name: 'SEND_EMAIL',
        when: Date.now(),
        payload: {
          type: 'INVITATION',
          email,
          inviterName,
          inviterEmail,
          message,
          activateLink: `${ config.webappUrl }/reset-password/${ token }`
        }
      }, {
        messageId: uuid.v4()
      })
    })
  )
}

const passwordRecovery = async (accountIdentifier, token) => {
  const { email, name } = await accountService.get(accountIdentifier)

  await jobService.create({
    name: 'SEND_EMAIL',
    when: Date.now(),
    payload: {
      type: 'PASSWORD_RECOVERY',
      email,
      accountName: name,
      resetLink: `${ config.webappUrl }/reset-password/${ token }`
    }
  }, {
    messageId: uuid.v4()
  })
}

const welcome = async (accountIdentifier, email) => {
  const { token } = await resetTokenService.create({ email })

  await jobService.create({
    name: 'SEND_EMAIL',
    when: Date.now(),
    payload: {
      type: 'WELCOME',
      email,
      activateLink: `${ config.webappUrl }/reset-password/${ token }`
    }
  }, {
    messageId: uuid.v4()
  })
}

export default {
  invite,
  passwordRecovery,
  welcome
}
