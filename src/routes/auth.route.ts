import { fromNodeHeaders } from "better-auth/node";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { auth } from "../lib/auth.js";

async function handleAuthPassthrough(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  const headers = fromNodeHeaders(request.headers);

  const req = new Request(url.toString(), {
    method: request.method,
    headers,
    ...(request.body ? { body: JSON.stringify(request.body) } : {}),
  });

  const response = await auth.handler(req);

  reply.status(response.status);
  response.headers.forEach((value, key) => reply.header(key, value));
  reply.send(response.body ? await response.text() : null);
}

export const authRoutes = (app: FastifyInstance) => {
  // Specific route for get-session with 2-minute handler timeout
  app.route({
    method: ["GET", "POST"],
    schema: {
      hide: true,
    },
    url: "/api/auth/get-session",
    handlerTimeout: 120000,
    handler: handleAuthPassthrough,
  });

  // Catch-all route for other auth endpoints
  app.route({
    method: ["GET", "POST"],
    schema: {
      hide: true,
    },
    url: "/api/auth/*",
    handler: handleAuthPassthrough,
  });
};
