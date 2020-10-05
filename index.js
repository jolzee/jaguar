require("dotenv-defaults").config();

const oas = require("fastify-oas");
const fastify = require("fastify")({
  http2: true,
  trustProxy: true,
});
const oauthPlugin = require("fastify-oauth2");
const port = process.env.PORT || 5000;
const host = process.env.HOST_NAME || "localhost";

const validStates = new Set();

fastify.register(oauthPlugin, {
  name: "googleOAuth2",
  scope: ["profile"],
  credentials: {
    client: {
      id:
        "1037571012411-kahoeuek9gc89plne97ct030lbbp0i0p.apps.googleusercontent.com",
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  // register a fastify url to start the redirect flow
  startRedirectPath: "/login/google",
  // facebook redirect here after the user login
  callbackUri: "http://joles.xyz:5000/login/google/callback",
  generateStateFunction: (request) => {
    const state = request.query.id;
    validStates.add(state);
    return state;
  },
  // custom function to check the state is valid
  checkStateFunction: (returnedState, callback) => {
    if (validStates.has(returnedState)) {
      callback();
      return;
    }
    callback(new Error("Invalid state"));
  },
});

fastify.get("/login/google/callback", async function (request, reply) {
  let state = request.query.state;
  let token = request.query.code;
  let scope = request.query.scope;

  // const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
  //   request
  // );

  console.log(state, token, scope);

  // if later you need to refresh the token you can use
  // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)

  reply.send({ access_token: token });
});

const swaggerConf = {
  routePrefix: "/documentation",
  swagger: {
    info: {
      title: "Jaguar API Server",
      description: "Provides a Set of Useful APIs",
      version: "0.1.0",
    },
    host: host.startsWith("localhost") ? `localhost:${port}` : host,
    tags: [
      {
        name: "utils",
        description: "A collection of useful utility end-points",
      },
    ],
    schemes: ["http", "https"],
    addModels: true,
    hideUntagged: true,
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    consumes: ["application/json"],
    produces: ["application/json"],
  },
  exposeRoute: true,
};

fastify
  .register(oas, swaggerConf)
  .register(require("fastify-cors"), {
    Array: process.env.CORS_ALLOWED_ORIGINS.split(",").map(function (origin) {
      return origin.trim();
    }),
    methods: ["GET", "POST"],
  })
  .register(require("fastify-helmet"))
  .register(require("fastify-boom"))
  .register(require("fastify-sensible"))
  .register(require("./routes/utilsRoutes"), { prefix: "/utils" });

fastify.listen(port, "0.0.0.0", function (err) {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
