const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    endpoint: 'http://127.0.0.1:9000',
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});

const fs = require('fs');

async function uploadImage(filePath, bucketName, keyName) {
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: 'uploads',
    Key: keyName,          // name of file in bucket
    Body: fileContent,
    ContentType: 'image/jpeg' // adjust based on file type
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('✅ File uploaded successfully:', data.Location);
    return data.Location;
  } catch (err) {
    console.error('❌ Error uploading file:', err);
    throw err;
  }
}

async function getImage(keyName) {
  const params = { Bucket: 'uploads', Key: keyName };
  const data = await s3.getObject(params).promise();
  return data.Body; // Buffer with image data
}

module.exports = { s3, uploadImage, getImage };
