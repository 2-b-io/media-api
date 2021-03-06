import uuid from 'uuid'

import createInvalidationModel from 'models/invalidation'
import jobService from 'services/job'
import projectService from 'services/project'

const create = async (projectIdentifier, { patterns = [] }) => {
  const project = await projectService.get(projectIdentifier)

  if (!project) {
    return null
  }

  const Invalidation = await createInvalidationModel()

  const invadidation = await new Invalidation({
    project: project._id,
    patterns,
    status:'INPROGRESS'
  }).save()

  if (invadidation) {
    await jobService.create({
      name: 'CREATE_INVALIDATION',
      when: Date.now(),
      payload: {
        projectIdentifier,
        invalidationIdentifier: invadidation.identifier
      }
    }, {
      messageId: uuid.v4()
    })
  }

  return invadidation
}

const get = async (projectIdentifier, invalidationIdentifier) => {
  const project = await projectService.get(projectIdentifier)

  if (!project) {
    return null
  }

  const Invalidation = await createInvalidationModel()

  return await Invalidation.findOne({
    identifier: invalidationIdentifier,
    project: project._id
  })
}

const list = async (projectIdentifier, condition = {}) => {
  const project = await projectService.get(projectIdentifier)

  if (!project) {
    return null
  }

  const Invalidation = await createInvalidationModel()

  return await Invalidation.find({
    project: project._id,
    ...condition
  })
}

const update = async (projectIdentifier, invalidationIdentifier, data) => {
  const project = await projectService.get(projectIdentifier)

  if (!project) {
    return null
  }

  const Invalidation = await createInvalidationModel()

  return await Invalidation.findOneAndUpdate({
    identifier: invalidationIdentifier,
    project: project._id
  }, data, {
    new: true
  })
}

export default {
  create,
  get,
  list,
  update
}
