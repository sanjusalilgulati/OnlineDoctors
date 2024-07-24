// const {AWS} = require('aws-sdk')
const {S3Client} = require('@aws-sdk/client-s3');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fs = require('fs');

const credentials = {
    accessKey : process.env.AWS_KEY,
    secret :    process.env.AWS_SECRET_KEY,
    bucketName :process.env.S3_BUCKET
}

const s3 = new S3Client({
    credentials : {
        secretAccessKey : process.env.AWS_SECRET_KEY,
        accessKeyId : process.env.AWS_KEY
    },
    region : process.env.S3_REGION
});


const uploadFile = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.S3_BUCKET,
      contentType : multerS3.AUTO_CONTENT_TYPE,
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      }
    })
  })

module.exports = {
    uploadFile
}