const awsconfig = require("extra-awsconfig");
const AWS = require("aws-sdk");
const { boolean } = require("boolean");
const _ = require("lodash");
var replaceall = require("replaceall");

// Global variables
const E = process.env;
const OPTIONS_BASE = {
  log: boolean(E["TTS_LOG"] || "0"),
  text: E["TTS_TEXT"] || null,
  retries: parseInt(E["TTS_RETRIES"] || "8", 10),
  acodec: E["TTS_ACODEC"] || "copy",
  audio: {
    encoding: E["TTS_AUDIO_ENCODING"] || null,
    frequency: parseInt(E["TTS_AUDIO_FREQUENCY"] || "0", 10)
  },
  language: {
    code: E["TTS_LANGUAGE_CODE"] || null,
    lexicons: (E["TTS_LANGUAGE_LEXICONS"] || "").split(",").filter(v => !!v)
  },
  voice: {
    name: E["TTS_VOICE_NAME"] || null,
    gender: E["TTS_VOICE_GENDER"] || "neutral"
  },
  quote: {
    break: parseFloat(E["TTS_QUOTE_BREAK"] || "250"),
    emphasis: E["TTS_QUOTE_EMPHASIS"] || "moderate"
  },
  heading: {
    break: parseFloat(E["TTS_HEADING_BREAK"] || "4000"),
    difference: parseFloat(E["TTS_HEADING_DIFFERENCE"] || "250"),
    emphasis: E["TTS_HEADING_EMPHASIS"] || "strong"
  },
  ellipsis: {
    break: parseFloat(E["TTS_ELLIPSIS_BREAK"] || "1500")
  },
  dash: {
    break: parseFloat(E["TTS_DASH_BREAK"] || "500")
  },
  newline: {
    break: parseFloat(E["TTS_NEWLINE_BREAK"] || "1000")
  },
  block: {
    separator: E["TTS_BLOCK_SEPARATOR"] || ".",
    length: parseFloat(E["TTS_BLOCK_LENGTH"] || "1500")
  },
  config: null
};
const VOICE = new Map([
  ["cmn-CN", { f: "Zhiyu", m: null }],
  ["da-DK", { f: "Naja", m: "Mads" }],
  ["nl-NL", { f: "Lotte", m: "Ruben" }],
  ["en-AU", { f: "Nicole", m: "Russell" }],
  ["en-GB", { f: "Amy", m: "Brian" }],
  ["en-IN", { f: "Aditi", m: null }],
  ["en-US", { f: "Joanna", m: "Matthew" }],
  ["en-GB-WLS", { f: null, m: "Geraint" }],
  ["fr-FR", { f: "Celine", m: "Mathieu" }],
  ["fr-CA", { f: "Chantal", m: null }],
  ["de-DE", { f: "Marlene", m: "Hans" }],
  ["hi-IN", { f: "Aditi", m: null }],
  ["is-IS", { f: "Dora", m: "Karl" }],
  ["it-IT", { f: "Carla", m: "Giorgio" }],
  ["ja-JP", { f: "Mizuki", m: "Takumi" }],
  ["ko-KR", { f: "Seoyeon", m: null }],
  ["nb-NO", { f: "Liv", m: null }],
  ["pl-PL", { f: "Ewa", m: "Jacek" }],
  ["pt-BR", { f: "Vitoria", m: "Ricardo" }],
  ["pt-PT", { f: "Ines", m: "Cristiano" }],
  ["ro-RO", { f: "Carmen", m: null }],
  ["ru-RU", { f: "Tatyana", m: "Tatyana" }],
  ["es-ES", { f: "Conchita", m: "Enrique" }],
  ["es-MX", { f: "Mia", m: null }],
  ["es-US", { f: "Penelope", m: "Miguel" }],
  ["sv-SE", { f: "Astrid", m: null }],
  ["tr-TR", { f: "Filiz", m: null }],
  ["cy-GB", { f: "Gwyneth", m: null }]
]);

// Get Polly synthesize speech params.
function pollyParams(options) {
  var ae = "mp3";
  var af = options.audio.frequency ? options.audio.frequency.toString() : null;
  var vg = /^f/i.test(options.voice.gender)
    ? "f"
    : /^m/i.test(options.voice.gender)
    ? "m"
    : null;
  var v = VOICE.get(options.language.code) || {},
    vn =
      options.voice.name ||
      (vg === "m" ? v.m || v.f || "Matthew" : v.f || v.m || "Joanna");

  return {
    LexiconNames: options.language.lexicons,
    OutputFormat: ae,
    SampleRate: af,
    Text: null,
    TextType: "ssml",
    VoiceId: vn,
    LanguageCode: options.language.code
  };
}

// Get SSML from text.
function textSsml(txt, options) {
  var q = options.quote,
    h = options.heading,
    e = options.ellipsis,
    d = options.dash,
    n = options.newline;
  txt = txt.replace(/\s*&\s*/g, " and ");
  txt = txt.replace(/\"(.*?)\"/gm, (m, p1) => {
    var brk = `<break time="${q.break}ms"/>`;
    var emp = `<emphasis level="${q.emphasis}">"${p1}"</emphasis>`;
    return brk + emp + brk;
  });
  txt = txt.replace(/(=+)\s(.*?)\s\1/g, (m, p1, p2) => {
    var brk = `<break time="${h.break - p1.length * h.difference}ms"/>`;
    var emp = `<emphasis level="${h.emphasis}">${p2}</emphasis>`;
    return brk + "Topic " + emp + brk;
  });
  // txt = txt.replace(/\((.*?)\)/gm, '<emphasis level="reduced">($1)</emphasis>');
  // txt = txt.replace(/\[(.*?)\]/gm, '<emphasis level="reduced">[$1]</emphasis>');
  txt = txt.replace(/\.\.\./g, `<break time="${e.break}ms"/>...`);
  txt = txt.replace(/\—/g, `<break time="${d.break}ms"/>—`);
  txt = txt.replace(/(\r?\n)+/gm, `<break time="${n.break}ms"/>\n`);
  // return `<speak><amazon:domain name="conversational">${txt}</amazon:domain></speak>`;
  return `<speak>${txt}</speak>`;
}

// Get SSML block from long text.
function textSsmlBlock(txt, options) {
  var b = options.block;
  for (var end = b.length; ; ) {
    end = Math.floor(0.75 * end);
    var i = txt.lastIndexOf(b.separator, end) + 1;
    i = i > 0 ? i : Math.min(txt.length, end);
    var ssml = textSsml(txt.substring(0, i), options);
    if (ssml.length < b.length) break;
  }
  return ssml;
}

function getTtsStream(ssml, tts, options) {
  var l = options.log,
    req = options.params;
  req.Text = ssml;
  // console.log(req);
  return new Promise((resolve, reject) => {
    tts.synthesizeSpeech(req, (err, res) => {
      if (err) return reject(err);
      // if (l) console.log("Received Polly Audio");
      resolve(res.AudioStream);
    });
  });
}

/**
 * Generate speech audio using "Amazon Polly"
 * @param {string} txt input text.
 * @param {object} options options.
 * @returns promise <out>.
 */
async function amazontts(txt, options) {
  txt = replaceall("?", ".", txt);
  txt = replaceall("...", ".", txt);
  txt = replaceall("..", ".", txt);
  var options = _.merge({}, OPTIONS_BASE, options);
  // if (options.log) console.log("@amazontts:", `Outputting Audio Stream`, txt);
  options.params = options.params || pollyParams(options);
  var tts = new AWS.Polly(awsconfig(options.config));

  var pollySayThis =
    txt.indexOf("<speak>") !== -1 ? txt : textSsmlBlock(txt, options);
  return getTtsStream(pollySayThis, tts, options);
}

module.exports = amazontts;
