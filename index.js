require("dotenv-defaults").config();

const Boom = require("boom");
const oas = require("fastify-oas");
const fastify = require("fastify")({ trustProxy: true });
const port = process.env.PORT || 3000;
const host = process.env.HOST_NAME || "localhost";

fastify
  .register(oas, {
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
  })
  .register(require("fastify-cors"), {
    RegExp: ["*"],
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
