import mongoose, { register } from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  headers: [ {
    name: String,
    value: String
  } ],
  pullURL: {
    type: String,
    index: true
  },
  allowedOrigins: [ String ]
}, {
  collection: 'pullSettings',
  timestamps: true
})

export default () => register('PullSetting', schema)