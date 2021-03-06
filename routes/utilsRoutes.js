const superagent = require("superagent");
const { createWorker } = require("tesseract.js");
const nodemailer = require("nodemailer");
const translate = require("@vitalets/google-translate-api");
const Handlebars = require("handlebars");
const Redis = require("ioredis");
const { extractAllData, wordsToNumbers } = require("../utils/utils");

const { SyncRedactor } = require("redact-pii");
const amazontts = require("../utils/polly");

const redactor = new SyncRedactor({
  customRedactors: {
    before: [
      {
        regexpPattern: /\b[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][ABD-HJLNP-UW-Z]{2}\b/gi,
        replaceWith: "UK_POST_CODE",
      },
    ],
  },
});

var redis = null;
try {
  if (process.env.REDIS_PORT) {
    redis = new Redis({
      port: parseInt(process.env.REDIS_PORT), // Redis port
      host: process.env.REDIS_HOST, // Redis host
      family: 4, // 4 (IPv4) or 6 (IPv6)
      password: process.env.REDIS_PASSWORD,
      db: 0,
    });
  } else if (process.env.REDIS_URL) {
    redis = new Redis(`${process.env.REDIS_URL}`);
  }
} catch (e) {
  console.error("Could not setup Redis connection", e);
}

// const langDetect = require("cld");
const utilsSchemas = require("../schemas/utilsSchemas");

require("isomorphic-fetch");
const gsheets = require("gsheets");

module.exports = function (fastify, opts, next) {
  fastify.get(
    "/weather/open-weather",
    utilsSchemas.openWeatherSchema,
    async function (request, reply) {
      const city = request.query.city;
      const lang = request.query.lang;
      const units = request.query.units;
      console.log(city, lang, units);
      superagent
        .get("https://community-open-weather-map.p.rapidapi.com/weather")
        .set("x-rapidapi-host", "community-open-weather-map.p.rapidapi.com")
        .set("x-rapidapi-key", process.env.X_RAPIDAPI_KEY)
        .query({
          q: city,
          lang: lang,
          units: units,
        })
        .then((res) => {
          console.log(res);
          reply.send(res.body);
        })
        .catch((err) => {
          console.log(err);
          reply.send(err);
        });
    }
  );

  fastify.get(
    "/ocr/tesseract",
    utilsSchemas.ocrTesseractSchema,
    async (request, reply) => {
      const worker = createWorker();

      const lang = request.query.lang;

      //  "afr amh ara asm aze aze_cyrl bel ben bih bod bos bul cat "
      //  "ceb ces chi_sim chi_tra chr cym cyr_lid dan deu div dzo "
      //  "ell eng enm epo est eus fas fil fin fra frk frm gle glg "
      //  "grc guj hat heb hin hrv hun hye iast iku ind isl ita ita_old "
      //  "jav jav_java jpn kan kat kat_old kaz khm kir kmr kor kur_ara lao lat "
      //  "lat_lid lav lit mal mar mkd mlt msa mya nep nld nor ori "
      //  "pan pol por pus ron rus san sin slk slv snd spa spa_old "
      //  "sqi srp srp_latn swa swe syr tam tel tgk tgl tha tir tur "
      //  "uig ukr urd uzb uzb_cyrl vie yid gle_uncial "

      const imageUrl = request.query.url;

      (async () => {
        await worker.load();
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        const {
          data: { text },
        } = await worker.recognize(imageUrl);
        let responseObj = extractAllData(text);
        responseObj.imgUrl = imageUrl;
        reply.send(responseObj);
        await worker.terminate();
      })();
    }
  );

  fastify.post("/send-sms", utilsSchemas.sendSmsTwilio, async function (
    request,
    reply
  ) {
    const body = request.body.message;
    const from = process.env.TWILIO_FROM_PHONE;
    const to = request.body.to;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);

    client.messages
      .create({ body: body, from: from, to: to })
      .then((message) => {
        reply.send({
          message: message.body,
          from: message.from,
          to: message.to,
          status: message.status,
        });
      });
  });

  fastify.get("/redact-pii", utilsSchemas.redactPiiSchema, async function (
    request,
    reply
  ) {
    const inputText = request.query.text;
    const redactedText = redactor.redact(inputText);
    reply.send({
      input: inputText,
      output: redactedText,
    });
  });

  fastify.get("/html-image", async function (request, reply) {
    const imageUrl = request.query.t;
    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Jaguar to the Rescue</title>
<style>
body {
	background: url(${imageUrl}) no-repeat top center scroll;
	-webkit-background-size: cover;
	-moz-background-size: cover;
	-o-background-size: cover;
	background-size: cover;
}
html {
    height: 100%
}
</style>
</head>
<body>
<div style="height: 1721px">
<!-- content -->
</div>

</body>
</html>`;
    reply.code(200).type("text/html; charset=UTF-8").send(html);
  });

  fastify.post(
    "/render-template",
    utilsSchemas.renderTemplateSchema,
    async (request, reply) => {
      let rawTemplate = request.body.template;
      let variables = request.body.variables;
      let template = Handlebars.compile(rawTemplate);
      reply.send({
        result: template(variables),
      });
    }
  );

  fastify.post("/redis", async (request, reply) => {
    let key = request.body.key;
    let infoToSave = request.body.data;
    redis.set(`JAGUAR-${key}`, JSON.stringify(infoToSave));
    reply.send({
      result: "ok",
    });
  });

  // AWS Polly
  fastify.get("/tts.mp3", async (request, reply) => {
    let fs = require("fs");
    var path = require("path");
    var errorAudioPath = path.join(__dirname, "..", "assets", "echo.mp3");

    try {
      let text = request.query.text;
      let voice = request.query.voice || null;
      let languageCode = request.query.langcode || null;
      let gender = request.query.gender || "neutral";
      console.log("TTS start");
      /**
       * en-IN, en-US, en-GB-WLS, fr-FR, fr-CA, de-DE, hi-IN, is-IS, it-IT, ja-JP, ko-KR, nb-NO, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, es-ES, es-MX, es-US, sv-SE, tr-TR, cy-GB
       */
      let streamResult = await amazontts(text, {
        voice: { name: voice, gender: gender, engine: "neural" },
        language: {
          code: languageCode,
        },
        log: false,
        config: {
          accessKeyId: process.env.AWS_POLLY_ACCESS_KEY,
          secretAccessKey: process.env.AWS_POLLY_SECRET,
          region: process.env.AWS_POLLY_REGION,
        },
      });
      console.log("TTS end");
      reply.type("audio/mpeg").send(streamResult);
    } catch (e) {
      console.error(e);
      const stream = fs.createReadStream(errorAudioPath);
      reply.type("audio/mpeg").send(stream);
    }
  });

  fastify.get("/redis", async (request, reply) => {
    let key = request.query.key;
    redis
      .get(`JAGUAR-${key}`)
      .then((value) => {
        if (value) {
          let data = JSON.parse(value);
          console.log(data);
          reply.send(data);
        } else {
          reply.send({
            result: "not found",
          });
        }
      })
      .catch((err) => {
        reply.send(err);
      });
  });

  fastify.delete("/redis", async (request, reply) => {
    let key = request.query.key;
    redis.del(`JAGUAR-${key}`);

    reply.send({
      result: "ok",
    });
  });

  fastify.get(
    "/translate/google",
    utilsSchemas.translateGoogleSchema,
    async function (request, reply) {
      const inputText = request.query.text;
      const toLang = request.query.to || "en";

      translate(inputText, { to: toLang })
        .then((res) => {
          reply.send({
            input: inputText,
            toLang: toLang,
            output: res.text,
            sourceLang: res.from.language.iso,
          });
        })
        .catch((err) => {
          reply.send(err);
        });
    }
  );

  // fastify.get(
  //   "/lang-detect",
  //   utilsSchemas.languageDetectSchema,
  //   async function (request, reply) {
  //     langDetect.detect(request.query.text, function (err, result) {
  //       if (err) {
  //         reply.send(err);
  //       } else {
  //         reply.send(result.languages);
  //       }
  //     });
  //   }
  // );

  fastify.get(
    "/url/shorten",
    utilsSchemas.urlShortenerSchema,
    async (request, reply) => {
      superagent
        .get("http://tinyurl.com/api-create.php")
        .query({ url: request.query.url })
        .then((res) => {
          reply.send({ url: res.text });
        })
        .catch((err) => {
          reply.send(err);
        });
    }
  );

  fastify.get(
    "/words-to-numbers",
    utilsSchemas.wordsToNumbersSchema,
    async function (request, reply) {
      const text = request.query.text;
      console.log(text);
      const newText = wordsToNumbers(text);

      console.log(newText);
      reply.send({
        input: text,
        output: newText,
      });
    }
  );

  //var ip = req.connection.remoteAddress
  fastify.get("/ip", utilsSchemas.ipSchema, async function (request, reply) {
    try {
      console.log("Raw IP:", request.raw.ip);
      console.log("Request IP: ", request.ip);
      console.log("Request IPs: ", request.ips);
      // let ips = request.ips;
      // reply.send(ips.length > 1 ? ips[1] : ips[0]);
      reply.send(request.raw.ip);
    } catch (e) {
      reply.send(e.message);
    }
  });

  fastify.get("/geo", async function (request, reply) {
    const ipAddress = request.query.ip;
    let locationInfo = {};
    superagent
      .get(`http://www.geoplugin.net/json.gp?ip=${ipAddress}`)
      .accept("application/json")
      .then((res) => {
        const loc = JSON.parse(res.text);
        // logger.debug(`📍 Obtained New Location Information`, loc);
        locationInfo = {
          ip: ipAddress,
          city: loc.geoplugin_city,
          continentCode: loc.geoplugin_continentCode,
          continentName: loc.geoplugin_continentName,
          countryCode: loc.geoplugin_countryCode,
          countryName: loc.geoplugin_countryName,
          currencySymbol: loc.geoplugin_currencySymbol,
          currencyCode: loc.geoplugin_currencyCode,
          latitude: loc.geoplugin_latitude,
          longitude: loc.geoplugin_longitude,
          regionCode: loc.geoplugin_regionCode,
          regionName: loc.geoplugin_regionName,
        };
        reply.send(locationInfo);
      })
      .catch((err) => {
        console.log(`📍 Unable to obtain location info`, err.message);
        reply.send(locationInfo);
      });
  });

  fastify.get("/gsheet", utilsSchemas.gsheetSchema, async function (
    request,
    reply
  ) {
    const googleSheetKey = request.query.spreadsheetKey;
    let worksheetTitle = request.query.worksheetTitle;

    // gsheets.getSpreadsheet(googleSheetKey).then(res => console.log(res));

    gsheets.getWorksheet(googleSheetKey, worksheetTitle).then(
      (res) => reply.send(res),
      (err) => reply.send(err)
    );
  });

  fastify.post(
    "/send-email",
    utilsSchemas.sendMailSchema,
    async (request, reply) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: "teneotest8@gmail.com",
        to: request.body.to,
        subject: request.body.subject,
        text: request.body.text,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          reply.send({ status: "error" });
        } else {
          console.log("Email sent: " + info.response);
          reply.send({ status: "sent" });
        }
      });
    }
  );

  fastify.post(
    "/send-email-ses",
    utilsSchemas.sendSesMailSchema,
    async (request, reply) => {
      const ses = require("../utils/ses");
      /* The following example sends a formatted email: */

      var params = {
        Destination: {
          BccAddresses: request.body.bcc || [],
          CcAddresses: request.body.cc || [],
          ToAddresses: request.body.to,
        },
        Message: {
          Body: {
            Text: {
              Charset: "UTF-8",
              Data: request.body.text,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: request.body.subject,
          },
        },
        ReturnPathArn: process.env.AWS_SES_RETURN_ARN,
        Source: process.env.AWS_SES_FROM_ADDRESS,
        SourceArn: process.env.AWS_SES_SOURCE_ARN,
      };

      if (request.body.html) {
        params.Message.Body.Html = {
          Charset: "UTF-8",
          Data: request.body.html,
        };
      }

      ses.sendEmail(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          reply.send({ status: "error" });
        }
        // an error occurred
        else {
          console.log(data); // successful response
          reply.send({
            status: "sent",
            sesData: data,
          });
        }
      });
    }
  );

  next();
};
