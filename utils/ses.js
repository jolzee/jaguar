const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET,
  region: process.env.AWS_SES_REGION,
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

module.exports = ses;
