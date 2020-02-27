require("dotenv-defaults").config();

const Boom = require("boom");
const oas = require("fastify-oas");
const fastify = require("fastify")();
const port = process.env.SERVER_PORT || 3000;

console.log(`MONGODB_URI = ${process.env.MONGODB_URI || "localhost"}`);

fastify
  .register(oas, {
    routePrefix: "/documentation",
    swagger: {
      info: {
        title: "Jaguar API Server",
        description: "Provides a Set of Useful APIs",
        version: "0.1.0"
      },
      host: `${process.env.HOST_NAME || "localhost"}:${port}`,
      tags: [
        {
          name: "utils",
          description: "A collection of useful utility end-points"
        }
      ],
      schemes: ["http"],
      addModels: true,
      hideUntagged: true,
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here"
      },
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        apiKey: {
          type: "apiKey",
          name: "apiKey",
          in: "header"
        }
      }
    },
    exposeRoute: true
  })
  .register(require("fastify-helmet"))
  .register(
    require("fastify-mongoose"),
    {
      uri: "process.env.MONGODB_URI"
    },
    err => {
      if (err) throw err;
    }
  )
  .register(require("fastify-boom"))
  .register(require("fastify-sensible"))
  .register(require("./schemas/user"))
  .register(require("fastify-auth"))
  .register(require("./auth/jwt-auth"))
  .register(require("./routes/userRoutes"), { prefix: "/users" })
  .register(require("./routes/indexRoutes"))
  .register(require("./routes/utilsRoutes"), { prefix: "/utils" });

fastify.listen(port, function(err) {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
