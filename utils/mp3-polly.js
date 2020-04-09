const aws = require("aws-sdk");
const streamifier = require("streamifier");

const polly = new aws.Polly({
  region: "eu-west-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = function(text, voice, type, callback) {
  const params = {
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voice,
    TextType: type
  };
  polly.synthesizeSpeech(params, function(err, data) {
    if (err) throw err;
    callback(streamifier.createReadStream(data.AudioStream));
  });
};
