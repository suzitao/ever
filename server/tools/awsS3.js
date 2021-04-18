import AWS from 'aws-sdk'

import { promiseOrCallback } from '../tools/util'

const accessKeyId = 'XXXXXX'
const secretAccessKey = 'XXXXXX'

const credentials = new AWS.Credentials({ accessKeyId, secretAccessKey })

AWS.config.update({ region: 'us-east-1', credentials })
const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

export const upload = promiseOrCallback(s3.upload, s3)
export const getObject = promiseOrCallback(s3.getObject, s3, data => data.Body)
export const listObjects = promiseOrCallback(s3.listObjects, s3)
export const getBucketLocation = promiseOrCallback(s3.getBucketLocation, s3)
