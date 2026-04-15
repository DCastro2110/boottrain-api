import console from "console";
import { fastify } from "fastify";

const app = fastify({
  logger: true,
});

app.get("/", async (request, reply) => {
  return { message: "Hello, World!" };
});

try {
  const port = Number(process.env.PORT) || 3000;

  await app.listen({ port });

  app.log.info(`Server listening at http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
