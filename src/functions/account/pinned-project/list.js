import { NOT_FOUND, OK } from 'http-status-codes'

import resource from 'rest/resource'
import pinnedProjectService from 'services/pinned-project'
import authorize from 'middlewares/authorize'
import config from 'infrastructure/config'

export default authorize([
  config.apps.WEBAPP,
  config.apps.JOB_LOOP,
  config.apps.CDN,
  config.apps.S3_SYNC,
  config.apps.ADMINAPP,
])(resource('PINNED_PROJECT')(
  async (req) => {
    const { accountIdentifier } = req.pathParameters
    // TODO: Authorization
    const pinnedProjects = await pinnedProjectService.list(accountIdentifier)

    if (!pinnedProjects) {
      return {
        statusCode: OK,
        resource: {
          projectIdentifiers: []
        }
      }
    }

    return {
      statusCode: OK,
      resource: pinnedProjects
    }
  }
))
