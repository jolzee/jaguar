const urlShortenerSchema = {
  schema: {
    description: "URL Shortener using TinyURL.com",
    tags: ["utils"],
    summary: "URL Shortener",
    required: ["url"],
    querystring: {
      url: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        properties: {
          url: { type: "string" },
        },
      },
    },
  },
};

const redactPiiSchema = {
  schema: {
    description: `Redacts a fair bit of personal information from US English text.

    Things like credentials, creditCardNumber, emailAddress, ipAddress, name, password, phoneNumber, streetAddress, username, usSocialSecurityNumber, zipcode, url and digits should be covered`,
    tags: ["utils"],
    summary: "Redact personal information",
    required: ["text"],
    querystring: {
      text: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        properties: {
          input: { type: "string" },
          output: { type: "string" },
        },
      },
    },
  },
};

const translateGoogleSchema = {
  schema: {
    description: `Translate text using Google translate.`,
    tags: ["utils", "translation"],
    summary: "Translation using Google Translate",
    required: ["text"],
    querystring: {
      text: { type: "string", description: "Source text to be translated" },
      to: {
        type: "string",
        description:
          "Target language code to translate to. If omitted defaults to 'en'. Others found here https://developers.google.com/admin-sdk/directory/v1/languages",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          input: { type: "string" },
          toLang: { type: "string" },
          output: { type: "string" },
          sourceLang: { type: "string" },
        },
      },
    },
  },
};

const languageDetectSchema = {
  schema: {
    description: "Language Detection",
    tags: ["utils", "language"],
    summary: "Detect the language of a text input",
    querystring: {
      text: {
        description: "The text you would like to analyze",
        type: "string",
      },
    },
    required: ["text"],
    response: {
      200: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            code: {
              type: "string",
            },
            percent: {
              type: "integer",
            },
            score: {
              type: "integer",
            },
          },
          required: ["name", "code", "percent", "score"],
        },
      },
    },
  },
};

const gsheetSchema = {
  schema: {
    description: "Read a Google Sheet as JSON",
    tags: ["utils"],
    summary: "GSheet as JSON",
    querystring: {
      spreadsheetKey: { type: "string" },
      worksheetTitle: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        properties: {
          updated: { type: "string" },
          title: { type: "string" },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                col1: {
                  type: "string",
                  description: "Value in respective column for row",
                },
                col2: {
                  type: "string",
                  description: "Value in respective column for row",
                },
              },
              additionalProperties: true,
              required: [],
            },
            additionalProperties: true,
            required: [],
          },
        },
        required: ["updated", "title"],
      },
    },
  },
};

const openWeatherSchema = {
  schema: {
    description: "Current Weather for City using Open Weather",
    tags: ["utils", "weather"],
    summary: "Current Weather for City",
    required: ["city", "language", "units"],
    querystring: {
      city: {
        description: "For example London, UK or Chicago",
        type: "string",
      },
      lang: {
        description:
          "You can use lang parameter to get output in your language. The following language values are supported: English - en, Russian - ru, Italian - it, Spanish - sp, Ukrainian - ua, German - de, Portuguese - pt, Romanian - ro, Polish - pl, Finnish - fi, Dutch - nl, French - fr, Bulgarian - bg, Swedish - se, Chinese Traditional - zh_tw, Chinese Simplified - zh_cn, Turkish - tr",
        type: "string",
      },
      units: {
        description:
          "You can use different types of metric systems by units = metric or imperial",
        type: "string",
      },
    },
    response: {
      200: {
        definitions: {},
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "http://example.com/root.json",
        type: "object",
        title: "The Root Schema",
        required: [
          "coord",
          "weather",
          "base",
          "main",
          "visibility",
          "dt",
          "sys",
          "timezone",
          "id",
          "name",
          "cod",
        ],
        properties: {
          coord: {
            $id: "#/properties/coord",
            type: "object",
            title: "The Coord Schema",
            required: ["lon", "lat"],
            properties: {
              lon: {
                $id: "#/properties/coord/properties/lon",
                type: "number",
                title: "The Lon Schema",
                default: 0.0,
                examples: [-122.33],
              },
              lat: {
                $id: "#/properties/coord/properties/lat",
                type: "number",
                title: "The Lat Schema",
                default: 0.0,
                examples: [47.61],
              },
            },
          },
          weather: {
            $id: "#/properties/weather",
            type: "array",
            title: "The Weather Schema",
            items: {
              $id: "#/properties/weather/items",
              type: "object",
              title: "The Items Schema",
              required: ["id", "main", "description", "icon"],
              properties: {
                id: {
                  $id: "#/properties/weather/items/properties/id",
                  type: "integer",
                  title: "The Id Schema",
                  default: 0,
                  examples: [500],
                },
                main: {
                  $id: "#/properties/weather/items/properties/main",
                  type: "string",
                  title: "The Main Schema",
                  default: "",
                  examples: ["Rain"],
                  pattern: "^(.*)$",
                },
                description: {
                  $id: "#/properties/weather/items/properties/description",
                  type: "string",
                  title: "The Description Schema",
                  default: "",
                  examples: ["light rain"],
                  pattern: "^(.*)$",
                },
                icon: {
                  $id: "#/properties/weather/items/properties/icon",
                  type: "string",
                  title: "The Icon Schema",
                  default: "",
                  examples: ["10n"],
                  pattern: "^(.*)$",
                },
              },
            },
          },
          base: {
            $id: "#/properties/base",
            type: "string",
            title: "The Base Schema",
            default: "",
            examples: ["stations"],
            pattern: "^(.*)$",
          },
          main: {
            $id: "#/properties/main",
            type: "object",
            title: "The Main Schema",
            required: [
              "temp",
              "feels_like",
              "temp_min",
              "temp_max",
              "pressure",
              "humidity",
            ],
            properties: {
              temp: {
                $id: "#/properties/main/properties/temp",
                type: "number",
                title: "The Temp Schema",
                default: 0.0,
                examples: [6.12],
              },
              feels_like: {
                $id: "#/properties/main/properties/feels_like",
                type: "number",
                title: "The Feels_like Schema",
                default: 0.0,
                examples: [2.14],
              },
              temp_min: {
                $id: "#/properties/main/properties/temp_min",
                type: "number",
                title: "The Temp_min Schema",
                default: 0.0,
                examples: [3.89],
              },
              temp_max: {
                $id: "#/properties/main/properties/temp_max",
                type: "integer",
                title: "The Temp_max Schema",
                default: 0,
                examples: [9],
              },
              pressure: {
                $id: "#/properties/main/properties/pressure",
                type: "integer",
                title: "The Pressure Schema",
                default: 0,
                examples: [1009],
              },
              humidity: {
                $id: "#/properties/main/properties/humidity",
                type: "integer",
                title: "The Humidity Schema",
                default: 0,
                examples: [93],
              },
            },
          },
          visibility: {
            $id: "#/properties/visibility",
            type: "integer",
            title: "The Visibility Schema",
            default: 0,
            examples: [9656],
          },
          wind: {
            $id: "#/properties/wind",
            type: "object",
            title: "The Wind Schema",
            required: ["speed", "deg", "gust"],
            properties: {
              speed: {
                $id: "#/properties/wind/properties/speed",
                type: "number",
                title: "The Speed Schema",
                default: 0.0,
                examples: [4.1],
              },
              deg: {
                $id: "#/properties/wind/properties/deg",
                type: "integer",
                title: "The Deg Schema",
                default: 0,
                examples: [180],
              },
              gust: {
                $id: "#/properties/wind/properties/gust",
                type: "number",
                title: "The Gust Schema",
                default: 0.0,
                examples: [7.7],
              },
            },
          },
          rain: {
            $id: "#/properties/rain",
            type: "object",
            title: "The Rain Schema",
            required: ["1h"],
            properties: {
              "1h": {
                $id: "#/properties/rain/properties/1h",
                type: "number",
                title: "The 1h Schema",
                default: 0.0,
                examples: [0.57],
              },
            },
          },
          clouds: {
            $id: "#/properties/clouds",
            type: "object",
            title: "The Clouds Schema",
            required: ["all"],
            properties: {
              all: {
                $id: "#/properties/clouds/properties/all",
                type: "integer",
                title: "The All Schema",
                default: 0,
                examples: [90],
              },
            },
          },
          dt: {
            $id: "#/properties/dt",
            type: "integer",
            title: "The Dt Schema",
            default: 0,
            examples: [1582464839],
          },
          sys: {
            $id: "#/properties/sys",
            type: "object",
            title: "The Sys Schema",
            required: ["type", "id", "country", "sunrise", "sunset"],
            properties: {
              type: {
                $id: "#/properties/sys/properties/type",
                type: "integer",
                title: "The Type Schema",
                default: 0,
                examples: [1],
              },
              id: {
                $id: "#/properties/sys/properties/id",
                type: "integer",
                title: "The Id Schema",
                default: 0,
                examples: [5451],
              },
              country: {
                $id: "#/properties/sys/properties/country",
                type: "string",
                title: "The Country Schema",
                default: "",
                examples: ["US"],
                pattern: "^(.*)$",
              },
              sunrise: {
                $id: "#/properties/sys/properties/sunrise",
                type: "integer",
                title: "The Sunrise Schema",
                default: 0,
                examples: [1582470114],
              },
              sunset: {
                $id: "#/properties/sys/properties/sunset",
                type: "integer",
                title: "The Sunset Schema",
                default: 0,
                examples: [1582508633],
              },
            },
          },
          timezone: {
            $id: "#/properties/timezone",
            type: "integer",
            title: "The Timezone Schema",
            default: 0,
            examples: [-28800],
          },
          id: {
            $id: "#/properties/id",
            type: "integer",
            title: "The Id Schema",
            default: 0,
            examples: [5809844],
          },
          name: {
            $id: "#/properties/name",
            type: "string",
            title: "The Name Schema",
            default: "",
            examples: ["Seattle"],
            pattern: "^(.*)$",
          },
          cod: {
            $id: "#/properties/cod",
            type: "integer",
            title: "The Cod Schema",
            default: 0,
            examples: [200],
          },
        },
      },
    },
  },
};

const wordsToNumbersSchema = {
  schema: {
    description: "Convert words to numbers",
    tags: ["utils"],
    summary: "Words to Numbers",
    querystring: {
      text: { type: "string" },
    },
    response: {
      200: {
        type: "object",
        properties: {
          input: { type: "string" },
          output: { type: "string" },
        },
      },
    },
  },
};

const ocrTesseractSchema = {
  schema: {
    description: "Extract Text from an Image using OCR and Tesseract",
    tags: ["utils", "image"],
    summary: "OCR Using Tesseract",
    querystring: {
      url: { type: "string", description: "Image URL" },
      lang: {
        type: "string",
        description:
          "afr amh ara asm aze aze_cyrl bel ben bih bod bos bul cat ceb ces chi_sim chi_tra chr cym cyr_lid dan deu div dzo ell eng enm epo est eus fas fil fin fra frk frm gle glg grc guj hat heb hin hrv hun hye iast iku ind isl ita ita_old jav jav_java jpn kan kat kat_old kaz khm kir kmr kor kur_ara lao lat lat_lid lav lit mal mar mkd mlt msa mya nep nld nor ori pan pol por pus ron rus san sin slk slv snd spa spa_old sqi srp srp_latn swa swe syr tam tel tgk tgl tha tir tur uig ukr urd uzb uzb_cyrl vie yid gle_uncial",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          imgUrl: { type: "string" },
          text: { type: "string" },
          emailAddresses: {
            type: "array",
            items: {
              type: "number",
            },
          },
          datesDayMonthYear: {
            type: "array",
            items: {
              type: "string",
            },
          },
          datesMonthDayYear: {
            type: "array",
            items: {
              type: "string",
            },
          },
          currencies: {
            type: "array",
            items: {
              type: "number",
            },
          },
          maxCurrency: { type: "number" },
          creditCardNumbers: {
            type: "object",
            properties: {
              all: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              visa: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              masterCard: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              amex: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              discovery: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
          usZipCodes: {
            type: "array",
            items: {
              type: "string",
            },
          },
          ukPostCodes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
      },
    },
  },
};

const sendSmsTwilio = {
  schema: {
    description:
      "Send a sms using Twilio - from phone number: " +
      process.env.TWILIO_FROM_PHONE,
    tags: ["utils", "sms"],
    summary: "Send a sms with Twilio",
    body: {
      type: "object",
      required: ["to", "message"],
      properties: {
        to: { type: "string", description: "In a format like +15554659840" },
        message: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          status: { type: "string" },
          from: { type: "string" },
          to: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const ipSchema = {
  schema: {
    description: "Determine your current ip address",
    tags: ["ip"],
    summary: "Get your external ip",
  },
};

const sendMailSchema = {
  schema: {
    description: "Send an email from teneotest8@gmail.com",
    tags: ["utils", "email"],
    summary: "Send Email",
    body: {
      type: "object",
      required: ["to", "subject", "text"],
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        text: { type: "string" },
      },
    },
  },
};

const renderTemplateSchema = {
  schema: {
    description: "Render a Handlebars tempalte",
    tags: ["template", "email"],
    summary: "Render a template",
    body: {
      type: "object",
      required: ["template", "variables"],
      properties: {
        template: { type: "string" },
        variables: { type: "object" },
      },
    },
  },
};

const sendSesMailSchema = {
  schema: {
    description: "Send emails through AWS SES",
    tags: ["utils", "email", "aws"],
    summary: "Send Email through AWS SES",
    body: {
      type: "object",
      required: ["from", "to", "subject", "text"],
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        cc: {
          type: "array",
          items: {
            type: "string",
          },
        },
        bcc: {
          type: "array",
          items: {
            type: "string",
          },
        },
        subject: { type: "string" },
        text: { type: "string" },
        awsSesAccessKey: {
          type: "string",
          description: "Optional - If specified overrides env variable config",
        },
        awsSesSecret: {
          type: "string",
          description: "Optional - If specified overrides env variable config",
        },
      },
    },
  },
};

module.exports = {
  gsheetSchema,
  languageDetectSchema,
  ocrTesseractSchema,
  openWeatherSchema,
  redactPiiSchema,
  sendMailSchema,
  sendSesMailSchema,
  sendSmsTwilio,
  urlShortenerSchema,
  wordsToNumbersSchema,
  translateGoogleSchema,
  ipSchema,
  renderTemplateSchema,
};
